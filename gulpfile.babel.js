import { src, series, dest, watch, task, parallel } from "gulp"
import { isDev } from "./.build/Build"

import browsersync from "browser-sync"
const server = isDev() && browsersync.create()

import crypto from "crypto"

import shell from "gulp-shell"
import gulpSass from "gulp-sass"
import dartSass from "sass"
const sass = gulpSass(dartSass)
import sourcemaps from "gulp-sourcemaps"
import twig from "gulp-twig"
import gulpif from "gulp-if"
import htmlmin from "gulp-htmlmin"

const assetsHash = crypto.createHash('md5').update((+new Date()).toString()).digest('hex')

const twigOptions = {
    functions: [
        {
            name: "assets",
            func: function(arg) {
                return `${arg}?ver=${assetsHash}`
            }
        }
    ]
}

task('scss', () => {
    return src('src/assets/scss/**/*.scss')
        .pipe(gulpif(isDev(), sourcemaps.init()))
        .pipe(
            gulpif(
                isDev(),
                sass().on('error', sass.logError),
                sass({ outputStyle: 'compressed' }).on('error', sass.logError)
            )
        )
        .pipe(gulpif(isDev(), sourcemaps.write('.')))
        .pipe(dest('public/assets/css'))
})

task('scss:watch', () => {
    watch('src/assets/scss/**/*.scss', series(['scss']))
})

task('twig', () => {
    return src('src/views/**/[^_]*.twig')
        .pipe(twig(twigOptions))
        .pipe(gulpif(!isDev(), htmlmin({ collapseWhitespace: true })))
        .pipe(dest('public'))
})

task('twig:watch', () => {
    watch('src/views/**/*.twig', series(['twig']))
})

task('dev:serve', () => {
    server.init({
        files: ["public/**/*"],
        watchEvents: ["add", "change", "addDir"],
        server: "public",
        port: 5000
    })
})

task('public:clean', shell.task('npx rimraf public'))

task('ts:compile', gulpif(
    isDev(),
    shell.task('npx rollup --config rollup.config.js --config-dev'),
    shell.task('npx rollup --config rollup.config.js')
))

task('ts:watch', shell.task('npx rollup --config rollup.config.js --config-dev --watch'))

task('build', series(['public:clean', 'ts:compile', 'scss', 'twig']))
task('dev', series([
    'public:clean',
    parallel([
        'scss',
        'twig',
        'ts:compile'
    ]),
    parallel([
        'dev:serve',
        'ts:watch',
        'scss:watch',
        'twig:watch'
    ])
]))
