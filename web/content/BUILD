load("@npm//@bazel/esbuild:index.bzl", "esbuild")
load("@npm//@bazel/typescript:index.bzl", "ts_project")
load("@build_bazel_rules_nodejs//:index.bzl", "copy_to_bin")

ts_project(
    name = "content",
    srcs = glob(["*.ts"]),
    declaration = True,
    extends = "@topo-go//:tsconfig.json",
    tsconfig = "tsconfig.json",
    visibility = ["//visibility:public"],
    deps = [
        "//web/api-v1",
        "@npm//@types",
        "@npm//incremental-dom",
    ],
)

copy_to_bin(
    name = "data",
    srcs = [
        "game-tiles.png",
        "index.css",
    ],
)

esbuild(
    name = "dist",
    args = [
        "--sourcemap",
        "--loader:.png=file",
        "--asset-names=asset/[name]-[hash]",
        "--chunk-names=chunk/[name]-[hash]",
        "--public-path=/content",
    ],
    entry_point = "index.ts",
    output_dir = True,
    tool = select({
        "@bazel_tools//src/conditions:darwin": "@esbuild_darwin//:bin/esbuild",
        "@bazel_tools//src/conditions:windows": "@esbuild_windows//:esbuild.exe",
        "@bazel_tools//src/conditions:linux_x86_64": "@esbuild_linux//:bin/esbuild",
    }),
    visibility = ["//visibility:public"],
    deps = [
        ":content",
        ":data",
    ],
)
