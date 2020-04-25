const babylon = require("babylon");
const traverse = require("babel-traverse").default;
const { transformFromAst } = require("babel-core");
const fs = require("fs");
let ID = 0;

/**
 * @name  createAsset
 * @desc  根据文件路径获取模块对象
 * @param {String} filename 文件路径
 */
function createAsset(filename) {
    //获取模块内容
    const content = fs.readFileSync(filename, "utf-8");
    //将模块内容转化成AST
    const ast = babylon.parse(content, {
        sourceType: "module"
    });
    //存放当前模块的依赖
    const dependencies = [];
    traverse(ast, {
        ImportDeclaration: (({ node }) => {
            dependencies.push(node.source.value);
        })
    });
    //转化成ES5，特别是ESModules
    const { code } = transformFromAst(ast, null, {
        preset: ['env']
    });

    const id = ID++;

    return {
        filename,
        id,
        code,
        dependencies
    }
}

/**
 * @name  createGraph
 * @desc  根据入口文件，创建依赖关系图谱
 * @param {String} entry 入口文件路径
 */

function createGraph(entry) {
    //获取入口文件的模块对象
    const entryModule = createAsset(entry);
    //放入依赖图谱中
    const queue = [entryModule];
    //循环构建依赖图谱
    for (const mod of queue) {
        //由于依赖的路径是相对于当前模块，所以要把相对路径都处理为绝对路径
        const dirname = path.dirname(asset.filename);
        //存放当前模块依赖对应的map
        mod.mapping = {};
        //遍历当前模块的依赖项
        mod.dependencies.forEach((relativePath) => {
            let absolutePath = path.join(dirname, relativePath);
            //创建依赖项模块对象
            let child = createAsset(absolutePath);
            mod.mapping[relativePath] = depModule.id
            //往依赖图谱中继续放入依赖模块
            queue.push(child);
        });
    }
    return queue;
}


/**
 * @name  bundle
 * @desc  根据依赖图谱打包运行
 * @param {Array} graph 依赖图谱
 */
function bundle(graph) {
    //把依赖图谱中需要的信息给取出
    const modules = {};
    graph.forEach((mod) => {
        modules[mod.id] = [
            mod.code,
            mod.mapping
        ]
    });

    //创建自定义require
    //这里require的是ID
    function requireHandler(id) {
        const module = {
            exports: {}
        };
        const [code, mapping] = modules[id];
        //由于模块内的require是require路径，我们要封装成require(id)
        function localRequire(localPath) {
            return requireHandler(mapping[localPath]);
        }
        let fn = new Function('require', 'module', 'exports', code + '\n return module.exports');
        let exportResult = fn(localRequire, module, module.exports);
        return exportResult;
    }

    requireHandler(0);
}

bundle(createGraph('./entry.js'));