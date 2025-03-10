# Use multi-stage build for production
FROM php:8.2-fpm AS php-base

# Set working directory
WORKDIR /var/www

# Install dependencies including oniguruma for mbstring
RUN apt-get update && apt-get install -y \
    build-essential \
    libpng-dev \
    libjpeg-dev \
    libfreetype6-dev \
    libonig-dev \
    locales \
    zip \
    jpegoptim optipng pngquant gifsicle \
    unzip \
    git \
    curl && \
    apt-get clean && rm -rf /var/lib/apt/lists/*

# Install Node.js properly (using LTS version)
RUN curl -fsSL https://deb.nodesource.com/setup_20.x | bash - && \
    apt-get install -y nodejs && \
    apt-get clean && rm -rf /var/lib/apt/lists/*

# Install PHP extensions
RUN docker-php-ext-install pdo_mysql mbstring exif pcntl bcmath && \
    docker-php-ext-configure gd --with-freetype --with-jpeg && \
    docker-php-ext-install -j$(nproc) gd

# Install Composer
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

# Copy all application files
COPY . .

# Install composer dependencies
RUN composer install --no-interaction --optimize-autoloader --no-dev

# Install npm dependencies and build assets
RUN npm ci && npm run build

# Generate .env file from example and key
RUN cp .env.example .env && \
    php artisan key:generate --force

# Configure PHP-FPM for production
RUN mv "$PHP_INI_DIR/php.ini-production" "$PHP_INI_DIR/php.ini"

# Set correct permissions
RUN chown -R www-data:www-data /var/www

# Final image with Nginx and Supervisor
FROM php:8.2-fpm AS php-final

WORKDIR /var/www

# Install dependencies for the final image, including oniguruma for mbstring
RUN apt-get update && apt-get install -y \
    libpng-dev \
    libjpeg-dev \
    libfreetype6-dev \
    libonig-dev \
    nginx \
    supervisor \
    nodejs && \
    apt-get clean && rm -rf /var/lib/apt/lists/*

# Install PHP extensions for the final image
RUN docker-php-ext-install pdo_mysql mbstring exif pcntl bcmath && \
    docker-php-ext-configure gd --with-freetype --with-jpeg && \
    docker-php-ext-install -j$(nproc) gd

# Copy built app from previous stage
COPY --from=php-base /var/www /var/www
COPY --from=php-base /usr/local/etc/php/php.ini /usr/local/etc/php/php.ini

# Copy Nginx and Supervisor configurations
COPY docker/nginx/nginx.conf /etc/nginx/sites-available/default
COPY docker/supervisor/supervisord.conf /etc/supervisor/conf.d/supervisord.conf

# Create required directories for Nginx and Supervisor if they don't exist
RUN mkdir -p /var/log/nginx /var/log/supervisor

# Set correct permissions
RUN chown -R www-data:www-data /var/www && \
    chown -R www-data:www-data /var/log/nginx && \
    chown -R www-data:www-data /var/log/supervisor && \
    chmod -R 775 /var/www/storage /var/www/bootstrap/cache

# Expose port 80 for HTTP and 4000 for Socket.IO
EXPOSE 80 4000

# Start services with supervisor
CMD ["/usr/bin/supervisord", "-c", "/etc/supervisor/conf.d/supervisord.conf"]