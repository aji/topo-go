load("@npm//@bazel/typescript:index.bzl", "ts_library")

filegroup(
    name = "sources",
    srcs = glob(["*.ts"]),
    visibility = ["//visibility:public"],
)

ts_library(
    name = "api-v1",
    srcs = ["sources"],
    module_name = "topo-go/web/api-v1",
    visibility = ["//visibility:public"],
)
