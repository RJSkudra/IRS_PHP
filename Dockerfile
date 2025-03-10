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

# Copy composer.json and composer.lock first to leverage Docker cache
COPY composer.json composer.lock ./

# Install Composer dependencies
RUN composer install --no-scripts --no-autoloader

# Copy package.json and package-lock.json
COPY package.json package-lock.json ./

# Install npm dependencies
RUN npm ci

# Copy existing application directory contents
COPY . .

# Generate optimized Composer autoload files
RUN composer dump-autoload --optimize

# Set correct permissions for the working directory
RUN chown -R www-data:www-data /var/www

# Change current user to www-data
USER www-data

# Expose ports
EXPOSE 8000 5173 4000

# Add environment variable for configuration
ENV APP_PORT=8000 \
    NODE_SERVER_PORT=4000 \
    VITE_PORT=5173 \
    HOST=0.0.0.0

# Start services
CMD ["sh", "-c", "node resources/js/server.js & npm run dev & php artisan serve --host=0.0.0.0 --port=$APP_PORT"]