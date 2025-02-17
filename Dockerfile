FROM php:8.1-fpm

# Set working directory
COPY ./laravel /var/www/html/
WORKDIR /var/www/html

# Install required Linux libraries and tools
RUN apt-get update -y && apt-get install -y \
    libicu-dev \
    libmariadb-dev \
    unzip zip \
    zlib1g-dev \
    libpng-dev \
    libjpeg-dev \
    libfreetype6-dev \
    libjpeg62-turbo-dev \
    libpng-dev \
    nano \
    nginx

# Install Composer
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

# Install PHP Extensions
RUN docker-php-ext-install gettext intl pdo_mysql gd

# Configure and install the GD extension
RUN docker-php-ext-configure gd --enable-gd --with-freetype --with-jpeg \
    && docker-php-ext-install -j$(nproc) gd

# Nginx configuration for local development
COPY nginx-local.conf /etc/nginx/conf.d/default.conf

RUN chgrp -R www-data /var/www/html
RUN chown -R www-data:www-data /var/www/html/storage
RUN chmod -R 777 /var/www/html/storage

# Enable PHP short tags for Laravel
RUN echo "short_open_tag = On" > /usr/local/etc/php/conf.d/short-tags.ini

# Start Nginx and PHP-FPM services
CMD ["sh", "-c", "php-fpm -D && nginx -g 'daemon off;'"]
