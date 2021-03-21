load("@npm//webpack-cli:index.bzl", webpack = "webpack_cli")

webpack(
    name = "dist",
    args = [
        "./$(execpath main.ts)",
        "--config",
        "$(execpath webpack.config.js)",
        "-o",
        "$(@D)",
        "--mode",
        "production",
    ],
    data = glob(["*.ts"]) + [
        "webpack.config.js",
        "//:tsconfig.json",
        "//web/api-v1:sources",
        "@npm//:node_modules",
    ],
    output_dir = True,
    visibility = ["//visibility:public"],
)
