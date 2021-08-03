// Определяем переменную "preprocessor"
let preprocessor = 'scss'; // Выбор препроцессора в проекте - scss или less
// Определяем константы Gulp
const {src, dest, parallel, series, watch} = require('gulp');
// Подключаем Browsersync
const browserSync = require('browser-sync').create();
// Подключаем gulp-concat
const concat = require('gulp-concat');
// Подключаем gulp-uglify-es
const uglify = require('gulp-uglify-es').default;
// Подключаем модули gulp-scss и gulp-less
const sass = require('gulp-sass');
const scss = require('gulp-scss');
const less = require('gulp-less');
// Подключаем Autoprefixer
const autoprefixer = require('gulp-autoprefixer');
// Подключаем модуль gulp-clean-css
const cleancss = require('gulp-clean-css');
// Подключаем gulp-imagemin для работы с изображениями
const imagemin = require('gulp-imagemin');
// Подключаем модуль gulp-newer
const newer = require('gulp-newer');
// Подключаем модуль del
const del = require('del');
// Подключаем модуль gulp-webp
const webp = require('gulp-webp');

// Определяем логику работы Browsersync
function browsersync() {
    browserSync.init({ // Инициализация Browsersync
        server: {baseDir: 'app/'}, // Указываем папку сервера
        notify: false, // Отключаем уведомления
        online: true // Режим работы: true или false
    })
}

function scripts() {
    return src([ // Берём файлы из источников
        'app/libs/jquery/app.min.js', // Пример подключения библиотеки
        // 'app/libs/slick-1.8.1/slick/slick.min.js', // Пример подключения библиотеки
        'app/js/app.js', // Пользовательские скрипты, использующие библиотеку, должны быть подключены в конце
    ])
        .pipe(concat('app.min.js')) // Конкатенируем в один файл
        .pipe(dest('app/js/')) // Выгружаем готовый файл в папку назначения
        .pipe(browserSync.stream()) // Триггерим Browsersync для обновления страницы
}

function scriptsMin() {
    return src([ // Берём файлы из источников
        'app/libs/jquery/app.min.js', // Пример подключения библиотеки
        'app/js/app.js', // Пользовательские скрипты, использующие библиотеку, должны быть подключены в конце
    ])
        .pipe(concat('app.min.js')) // Конкатенируем в один файл
        .pipe(uglify()) // Сжимаем JavaScript
        .pipe(dest('app/js/')) // Выгружаем готовый файл в папку назначения
        .pipe(browserSync.stream()) // Триггерим Browsersync для обновления страницы
}

function startwatch() {

    // Выбираем все файлы JS в проекте, а затем исключим с суффиксом .min.js
    watch(['app/**/*.js', '!app/**/*.min.js'], scripts);
    // Мониторим файлы препроцессора на изменения
    watch('app/**/' + preprocessor + '/**/*', styles);
    // Мониторим файлы HTML на изменения
    watch('app/**/*.html').on('change', browserSync.reload);
    // Мониторим папку-источник изображений и выполняем images(), если есть изменения
    watch(['app/images/**/*', '!app/images/dest'], images, convertImgtoWebp);
}

function styles() {
    return src([
        'app/libs/bootstrap/bootstrap.css',
        'app/' + preprocessor + '/main.' + preprocessor + '', // Выбираем источник: "app/scss/main.scss" или "app/less/main.less"
    ])
        .pipe(eval('sass')()) // Преобразуем значение переменной "preprocessor" в функцию
        .pipe(concat('app.min.css')) // Конкатенируем в файл app.js
        .pipe(autoprefixer({
            overrideBrowserslist: ['last 10 versions'],
            grid: true
        })) // Создадим префиксы с помощью Autoprefixer
        .pipe(dest('app/css/')) // Выгрузим результат в папку "app/css/"
        .pipe(browserSync.stream()) // Сделаем инъекцию в браузер
}

function stylesBuild() {
    return src([
        'app/libs/bootstrap/bootstrap.css',
        'app/' + preprocessor + '/main.' + preprocessor + '', // Выбираем источник: "app/scss/main.scss" или "app/less/main.less"
    ])
        .pipe(eval('sass')()) // Преобразуем значение переменной "preprocessor" в функцию
        .pipe(concat('app.min.css')) // Конкатенируем в файл app.min.js
        .pipe(autoprefixer({
            overrideBrowserslist: ['last 10 versions'],
            grid: true
        })) // Создадим префиксы с помощью Autoprefixer
        .pipe(cleancss({level: {1: {specialComments: 0}}/* , format: 'beautify' */})) // Минифицируем стили
        .pipe(dest('app/css/')) // Выгрузим результат в папку "app/css/"
        .pipe(browserSync.stream()) // Сделаем инъекцию в браузер
}

function images() {
    return src(['app/images/**/*', '!app/images/dest/**']) // Берём все изображения из папки источника
        .pipe(dest('app/images/dest/')) // Выгружаем оптимизированные изображения в папку назначения


}

function convertImgtoWebp() {
    return src(['app/images/**/*', '!app/images/dest/**']) // Берём все изображения из папки источника
        .pipe(webp())
        .pipe(dest('app/images/dest/')) // Выгружаем оптимизированные изображения в папку назначения


}

function imagesMin() {
    return src(['app/images/**/*', '!app/images/dest/**']) // Берём все изображения из папки источника
        .pipe(newer('app/images/dest/')) // Проверяем, было ли изменено (сжато) изображение ранее
        .pipe(imagemin()) // Сжимаем и оптимизируем изображеня
        .pipe(dest('app/images/dest/')) // Выгружаем оптимизированные изображения в папку назначения
}

function cleanimg() {
    return del('app/images/dest/**/*', {force: true}) // Удаляем всё содержимое папки "app/images/dest/"
}


function buildcopy() {
    return src([ // Выбираем нужные файлы
        'app/css/app.min.css',
        'app/js/**/*.min.js',
        'app/images/dest/**/*',
        'app/*.html',
    ], {base: 'app'}) // Параметр "base" сохраняет структуру проекта при копировании
        .pipe(dest('dist')) // Выгружаем в папку с финальной сборкой
}

function cleandist() {
    return del('dist/**/*', {force: true}) // Удаляем всё содержимое папки "dist/"
}

// Экспортируем функцию browsersync() как таск browsersync. Значение после знака = это имеющаяся функция.
exports.browsersync = browsersync;
// Экспортируем функцию scripts() в таск scripts
exports.scripts = scripts;
// Экспортируем функцию styles() в таск styles
exports.styles = styles;
// Экспорт функции images() в таск images
exports.images = images;
// Экспортируем функцию cleanimg() как таск cleanimg
exports.cleanimg = cleanimg;
// Создаём новый таск "build", который последовательно выполняет нужные операции
exports.build = series(cleandist, stylesBuild, scriptsMin, imagesMin, convertImgtoWebp, buildcopy);
// Экспортируем дефолтный таск с нужным набором функций
exports.default = parallel(styles, scripts, images, convertImgtoWebp, browsersync, startwatch);