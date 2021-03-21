load("@npm//@bazel/typescript:index.bzl", "ts_library")
load("@build_bazel_rules_nodejs//:index.bzl", "nodejs_binary")

ts_library(
    name = "app_compile",
    srcs = glob([
        "*.ts",
        "server/**/*.ts",
    ]),
    module_name = "topo-go/web/app",
    deps = [
        "//game",
        "//web/api-v1",
        "@npm//@types",
        "@npm//ejs",
        "@npm//express",
        "@npm//pino",
    ],
)

nodejs_binary(
    name = "app",
    data = [
        ":app_compile",
        "//web/content:dist",
    ] + glob([
        "views/*",
        "static/*",
    ]),
    entry_point = "main.ts",
)
