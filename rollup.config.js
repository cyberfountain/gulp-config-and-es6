import typescript from "@rollup/plugin-typescript"
import { terser } from "rollup-plugin-terser"
import clear from "rollup-plugin-clear"
import { isDev, files } from "./.build/Build"

export default [
    {
        input: [
            ...files("src/assets/ts"),
            ...files("src/assets/ts/pages")
        ],
        output: {
            dir: "public/assets/js",
            format: "esm",
            sourcemap: isDev()
        },
        plugins: [
            clear({
                targets: ['public/assets/js'],
                watch: true
            }),
            typescript({
                tsconfig: "./tsconfig.json"
            }),
            !isDev() && terser({
                format: {
                    comments: false
                }
            })
        ]
    }
]
