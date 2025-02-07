<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Form Validation</title>
</head>
<body>
    <?php
    $servername = "192.168.1.10:3306";
    $username = "irs";
    $password = "irspass";
    $dbname = "irs_db";

    // Create connection
    $conn = new mysqli($servername, $username, $password, $dbname);

    // Check connection
    if ($conn->connect_error) {
        echo "Failed to connect to the database: " . $conn->connect_error;
    } else {
        echo "Successfully connected to the database.";
    }
    ?>
    <?php
    $nameErr = $surnameErr = $ageErr = $phoneErr = $addressErr = "";
    $name = $surname = $age = $phone = $address = "";

    if ($_SERVER["REQUEST_METHOD"] == "POST") {
        if (empty($_POST["name"])) {
            $nameErr = "Name is required";
        } else {
            $name = test_input($_POST["name"]);
            if (!preg_match("/^[a-zA-Z-' ]*$/",$name)) {
                $nameErr = "Only letters and white space allowed";
            }
        }

        if (empty($_POST["surname"])) {
            $surnameErr = "Surname is required";
        } else {
            $surname = test_input($_POST["surname"]);
            if (!preg_match("/^[a-zA-Z-' ]*$/",$surname)) {
                $surnameErr = "Only letters and white space allowed";
            }
        }

        if (empty($_POST["age"])) {
            $ageErr = "Age is required";
        } else {
            $age = test_input($_POST["age"]);
            if (!filter_var($age, FILTER_VALIDATE_INT)) {
                $ageErr = "Invalid age format";
            }
        }

        if (empty($_POST["phone"])) {
            $phoneErr = "Phone number is required";
        } else {
            $phone = test_input($_POST["phone"]);
            if (!preg_match("/^[0-9]{10}$/",$phone)) {
                $phoneErr = "Invalid phone number format";
            }
        }

        if (empty($_POST["address"])) {
            $addressErr = "Home address is required";
        } else {
            $address = test_input($_POST["address"]);
        }
    }

    function test_input($data) {
        $data = trim($data);
        $data = stripslashes($data);
        $data = htmlspecialchars($data);
        return $data;
    }
    ?>

    <h2>PHP Form Validation Example</h2>
    <form method="post" action="<?php echo htmlspecialchars($_SERVER["PHP_SELF"]);?>">
        Name: <input type="text" name="name" value="<?php echo $name;?>">
        <span class="error">* <?php echo $nameErr;?></span>
        <br><br>
        Surname: <input type="text" name="surname" value="<?php echo $surname;?>">
        <span class="error">* <?php echo $surnameErr;?></span>
        <br><br>
        Age: <input type="text" name="age" value="<?php echo $age;?>">
        <span class="error">* <?php echo $ageErr;?></span>
        <br><br>
        Phone Number: <input type="text" name="phone" value="<?php echo $phone;?>">
        <span class="error">* <?php echo $phoneErr;?></span>
        <br><br>
        Home Address: <input type="text" name="address" value="<?php echo $address;?>">
        <span class="error">* <?php echo $addressErr;?></span>
        <br><br>
        <input type="submit" name="submit" value="Submit">
        <input type="submit" name="create_table" value="Create Table">
    </form>

    <?php
    if ($_SERVER["REQUEST_METHOD"] == "POST" && empty($nameErr) && empty($surnameErr) && empty($ageErr) && empty($phoneErr) && empty($addressErr) && isset($_POST["submit"])) {
        $stmt = $conn->prepare("INSERT INTO users (name, surname, age, phone, address) VALUES (?, ?, ?, ?, ?)");
        $stmt->bind_param("ssiss", $name, $surname, $age, $phone, $address);

        if ($stmt->execute()) {
            echo "New record created successfully";
        } else {
            echo "Error: " . $stmt->error;
        }

        $stmt->close();
    }

    if ($_SERVER["REQUEST_METHOD"] == "POST" && isset($_POST["create_table"])) {
        $sql = "CREATE TABLE IF NOT EXISTS users (
            id INT(6) UNSIGNED AUTO_INCREMENT PRIMARY KEY,
            name VARCHAR(30) NOT NULL,
            surname VARCHAR(30) NOT NULL,
            age INT(3) NOT NULL,
            phone VARCHAR(10) NOT NULL,
            address VARCHAR(50) NOT NULL,
            reg_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        )";

        if ($conn->query($sql) === TRUE) {
            echo "Table users created successfully";
        } else {
            if ($conn->errno == 1050) {
                echo "Table users already exists";
            } else {
                echo "Error creating table: " . $conn->error;
            }
        }
    }

    if ($_SERVER["REQUEST_METHOD"] == "POST" && isset($_POST["delete"])) {
        $id_to_delete = $_POST["id"];
        $stmt = $conn->prepare("DELETE FROM users WHERE id = ?");
        $stmt->bind_param("i", $id_to_delete);

        if ($stmt->execute()) {
            echo "Record deleted successfully";
        } else {
            echo "Error deleting record: " . $stmt->error;
        }

        $stmt->close();
    }

    $result = $conn->query("SELECT * FROM users");

    if ($result === FALSE) {
        die("Error: " . $conn->error);
    }

    if ($result->num_rows > 0) {
        echo "<h2>Users Table</h2>";
        echo "<table border='1'>
                <tr>
                    <th>ID</th>
                    <th>Name</th>
                    <th>Surname</th>
                    <th>Age</th>
                    <th>Phone</th>
                    <th>Address</th>
                    <th>Registration Date</th>
                    <th>Action</th>
                </tr>";
        while($row = $result->fetch_assoc()) {
            echo "<tr>
                    <td>" . $row["id"]. "</td>
                    <td>" . $row["name"]. "</td>
                    <td>" . $row["surname"]. "</td>
                    <td>" . $row["age"]. "</td>
                    <td>" . $row["phone"]. "</td>
                    <td>" . $row["address"]. "</td>
                    <td>" . $row["reg_date"]. "</td>
                    <td>
                        <form method='post' action='" . htmlspecialchars($_SERVER["PHP_SELF"]) . "'>
                            <input type='hidden' name='id' value='" . $row["id"] . "'>
                            <input type='submit' name='delete' value='Delete'>
                        </form>
                    </td>
                  </tr>";
        }
        echo "</table>";
    } else {
        echo "0 results";
    }

    $conn->close();
    ?>
</body>
</html>
