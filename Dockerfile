# Use multi-stage build for production
FROM php:8.2-fpm AS php-base

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
    libonig-dev && \
    apt-get clean && rm -rf /var/lib/apt/lists/*

# Install Node.js properly (using LTS version)
RUN curl -fsSL https://deb.nodesource.com/setup_20.x | bash - && \
    apt-get install -y nodejs && \
    apt-get clean && rm -rf /var/lib/apt/lists/*

# Install PHP extensions
RUN docker-php-ext-install pdo_mysql mbstring exif pcntl bcmath gd

# Install Composer
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

# Copy composer files
COPY composer.json composer.lock ./ 

# Install dependencies
RUN composer install --no-scripts --no-autoloader

# Copy package files and install dependencies
COPY package.json package-lock.json ./
RUN npm ci

# Copy all application files
COPY . .

# Build frontend assets
RUN npm run build

# Generate optimized autoload files
RUN composer dump-autoload --optimize

# Configure PHP-FPM for production
RUN mv "$PHP_INI_DIR/php.ini-production" "$PHP_INI_DIR/php.ini"

# Set correct permissions
RUN chown -R www-data:www-data /var/www

# Final image with Nginx and Supervisor
FROM php:8.2-fpm

WORKDIR /var/www

# Install Nginx and Supervisor
RUN apt-get update && apt-get install -y \
    nginx \
    supervisor \
    nodejs npm && \
    apt-get clean && rm -rf /var/lib/apt/lists/*

# Install PHP extensions again for the final image
RUN docker-php-ext-install pdo_mysql mbstring exif pcntl bcmath gd

# Copy built app from previous stage
COPY --from=php-base /var/www /var/www
COPY --from=php-base /usr/local/etc/php/php.ini /usr/local/etc/php/php.ini

# Copy Nginx and Supervisor configurations
COPY docker/nginx/nginx.conf /etc/nginx/sites-available/default
COPY docker/supervisor/supervisord.conf /etc/supervisor/conf.d/supervisord.conf

# Set correct permissions
RUN chown -R www-data:www-data /var/www

# Expose ports
EXPOSE 80

# Start services with supervisor
CMD ["/usr/bin/supervisord", "-c", "/etc/supervisor/conf.d/supervisord.conf"]