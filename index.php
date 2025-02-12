<!DOCTYPE html>
<html lang="lv">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>IRS datu ievade</title>
    <link rel="stylesheet" href="style.css">
</head>
<body>
    <?php
    $servername = "192.168.1.10:3306";
    $username = "irs";
    $password = "irspass";
    $dbname = "irs_db";

    $conn = new mysqli($servername, $username, $password, $dbname);

    if ($conn->connect_error) {
        echo "<div class='message error-message'>Failed to connect to the database: " . $conn->connect_error . "</div>";
    }

    $nameErr = $surnameErr = $ageErr = $phoneErr = $addressErr = "";
    $name = $surname = $age = $phone = $address = "";

    function test_input($data) {
        $data = trim($data);
        $data = stripslashes($data);
        $data = htmlspecialchars($data);
        return $data;
    }

    if ($_SERVER["REQUEST_METHOD"] == "POST") {
        if (empty($_POST["name"])) {
            $nameErr = "Vārds ir obligāts";
        } else {
            $name = test_input($_POST["name"]);
            if (!preg_match("/^[a-zA-ZāĀēĒīĪōŌūŪčČšŠžŽņŅģĢķĶļĻŗŖ\-' ]{2,}$/u",$name)) {
                $nameErr = "Atļauti tikai burti, defise un apostrofi. Vismaz 2 rakstzīmes.";
            }
        }

        if (empty($_POST["surname"])) {
            $surnameErr = "Uzvārds ir obligāts";
        } else {
            $surname = test_input($_POST["surname"]);
            if (!preg_match("/^[a-zA-ZāĀēĒīĪōŌūŪčČšŠžŽņŅģĢķĶļĻŗŖ\-' ]{2,}$/u",$surname)) {
                $surnameErr = "Atļauti tikai burti, defise un apostrofi. Vismaz 2 rakstzīmes.";
            }
        }

        if (empty($_POST["age"])) {
            $ageErr = "Vecums ir obligāts";
        } else {
            $age = test_input($_POST["age"]);
            if (!filter_var($age, FILTER_VALIDATE_INT)) {
                $ageErr = "Nederīgs vecuma formāts";
            }
        }

        if (empty($_POST["phone"])) {
            $phoneErr = "Telefona numurs ir obligāts";
        } else {
            $phone = test_input($_POST["phone"]);
            if (!preg_match("/^[0-9]{8}$/",$phone)) {
                $phoneErr = "Nederīgs telefona numura formāts";
            }
        }

        if (empty($_POST["address"])) {
            $addressErr = "Adrese ir obligāta";
        } else {
            $address = test_input($_POST["address"]);
            if (preg_match("/^[0-9]+$/", $address)) {
                $addressErr = "Adrese nevar būt tikai cipari";
            }
        }

        if (empty($nameErr) && empty($surnameErr) && empty($ageErr) && empty($phoneErr) && empty($addressErr) && isset($_POST["submit"])) {
            $stmt = $conn->prepare("INSERT INTO users (name, surname, age, phone, address) VALUES (?, ?, ?, ?, ?)");
            $stmt->bind_param("ssiss", $name, $surname, $age, $phone, $address);

            if ($stmt->execute()) {
                echo "<div class='message success'>Ieraksts veiksmīgi pievienots</div>";
                header("Location: " . $_SERVER["PHP_SELF"] . "?success=true");
                exit();
            } else {
                echo "<div class='message error-message'>Kļūda: " . $stmt->error . "</div>";
            }

            $stmt->close();
        }

        if (isset($_POST["create_table"])) {
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
                echo "<div class='message success'>Tabula 'users' veiksmīgi izveidota</div>";
            } else {
                if ($conn->errno == 1050) {
                    echo "<div class='message error-message'>Tabula 'users' jau eksistē</div>";
                } else {
                    echo "<div class='message error-message'>Kļūda veidojot tabulu: " . $conn->error . "</div>";
                }
            }
        }

        if (isset($_POST["delete_all"])) {
            $sql = "DELETE FROM users";

            if ($conn->query($sql) === TRUE) {
                echo "<div class='message success'>Visi ieraksti veiksmīgi dzēsti</div>";
                header("Location: " . $_SERVER["PHP_SELF"] . "?deleted_all=true");
                exit();
            } else {
                echo "<div class='message error-message'>Kļūda dzēšot visus ierakstus: " . $conn->error . "</div>";
            }
        }

        if (isset($_POST["delete"])) {
            $id_to_delete = $_POST["id"];
            $stmt = $conn->prepare("DELETE FROM users WHERE id = ?");
            $stmt->bind_param("i", $id_to_delete);

            if ($stmt->execute()) {
                echo "<div class='message success'>Ieraksts veiksmīgi dzēsts</div>";
                header("Location: " . $_SERVER["PHP_SELF"] . "?deleted=true");
                exit();
            } else {
                echo "<div class='message error-message'>Kļūda dzēšot ierakstu: " . $stmt->error . "</div>";
            }

            $stmt->close();
        }
    }
    ?>

    <div class="form-container">
        <h1 class="form-title">IRS datu ievade</h1>
        <form method="post" action="<?php echo htmlspecialchars($_SERVER["PHP_SELF"]);?>">
            <div class="form-grid">
                <div class="form-group">
                    <label for="name">Vārds</label>
                    <input type="text" id="name" name="name" value="<?php echo $name;?>">
                    <span class="error"><?php echo $nameErr;?></span>
                </div>
                
                <div class="form-group">
                    <label for="surname">Uzvārds</label>
                    <input type="text" id="surname" name="surname" value="<?php echo $surname;?>">
                    <span class="error"><?php echo $surnameErr;?></span>
                </div>
                
                <div class="form-group">
                    <label for="age">Vecums</label>
                    <input type="text" id="age" name="age" value="<?php echo $age;?>">
                    <span class="error"><?php echo $ageErr;?></span>
                </div>
                
                <div class="form-group">
                    <label for="phone">Telefona nr.</label>
                    <input type="tel" id="phone" name="phone" value="<?php echo $phone;?>">
                    <span class="error"><?php echo $phoneErr;?></span>
                </div>
                
                <div class="form-group full-width">
                    <label for="address">Adrese</label>
                    <input type="text" id="address" name="address" value="<?php echo $address;?>">
                    <span class="error"><?php echo $addressErr;?></span>
                </div>

                <div class="button-group">
                    <input type="submit" name="submit" value="Iesniegt" class="button submit-button">
                    <input type="submit" name="create_table" value="Izveidot tabulu" class="button create-table-button">
                    <input type="submit" name="delete_all" value="Dzēst visus ierakstus" class="button delete-all-button">
                </div>
            </div>
        </form>

        <?php
        $result = $conn->query("SELECT * FROM users");

        if ($result && $result->num_rows > 0) {
            echo "<h2>Lietotāju saraksts</h2>";
            echo "<table class='users-table'>
                    <tr>
                        <th>ID</th>
                        <th>Vārds</th>
                        <th>Uzvārds</th>
                        <th>Vecums</th>
                        <th>Telefons</th>
                        <th>Adrese</th>
                        <th>Reģistrācijas datums</th>
                        <th>Darbība</th>
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
                                <input type='submit' name='delete' value='Dzēst' class='button delete-button'>
                            </form>
                        </td>
                      </tr>";
            }
            echo "</table>";
        }

        $conn->close();
        ?>

        <div class="footer">
            IRS™ © ® 2025
        </div>
    </div>
</body>
</html>