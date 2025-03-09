FROM php:8.2-fpm

# Set working directory
WORKDIR /var/www

# Install dependencies
RUN apt-get update && apt-get install -y \
    build-essential \
    libpng-dev \
    libjpeg-dev \
    libfreetype6-dev \
    locales \
    zip \
    jpegoptim optipng pngquant gifsicle \
    vim \
    unzip \
    git \
    curl \
    nodejs \
    npm \
    libonig-dev

# Clear cache
RUN apt-get clean && rm -rf /var/lib/apt/lists/*

# Install PHP extensions
RUN docker-php-ext-install pdo_mysql mbstring exif pcntl bcmath gd

# Install Composer
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

# Copy existing application directory contents
COPY . /var/www

# Set correct permissions for the working directory
RUN chown -R www-data:www-data /var/www

# Install Composer dependencies
RUN composer install

# Install npm dependencies and build assets
RUN npm install

# Change current user to www-data
USER www-data

# Expose port 9000 for php-fpm and port 3000 for npm
EXPOSE 9000 3000 4000

# Start npm and php artisan serve
CMD ["sh", "-c", "npm run dev & php artisan serve --host=0.0.0.0 --port=9000"]