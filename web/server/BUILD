load("@npm//@bazel/typescript:index.bzl", "ts_library")
load("@build_bazel_rules_nodejs//:index.bzl", "nodejs_binary")

ts_library(
    name = "server_compile",
    srcs = glob(["*.ts"]),
    module_name = "topo-go/web/server",
    deps = [
        "@npm//@types",
        "@npm//express",
        "@npm//pino",
        "@npm//pug",
    ],
)

nodejs_binary(
    name = "server",
    data = [
        ":server_compile",
        "//web/content:dist",
    ] + glob([
        "views/*",
        "static/*",
    ]),
    entry_point = "main.ts",
)
