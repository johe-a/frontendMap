const middlewares = [];
const use = (fn) => middlewares.push(fn);
const ctx = {};

async function f1(ctx, next) {
    console.log('f1 start');
    await next();
    console.log('f1 end');
}
async function f2(ctx, next) {
    console.log('f2 start');
    await next();
    console.log('f2 end');
}
async function f3(ctx, next) {
    console.log('service end');
}

use(f1);
use(f2);
use(f3);

function compose(ctx, middlewares) {
    //返回一个包含ctx,middlewares闭包的函数,该函数是一个自动执行器
    //自动执行中间件
    return function () {
        const len = middlewares.length;
        //执行中间件,index是中间件的下标
        //dispatch函数返回Promise
        function dispatch(index) {
            //index从0开始，如果index===len代表下标len-1已执行完毕
            if (index === len) {
                return Promise.resolve();
            } else {
                try {
                    //执行当前中间件
                    return Promise.resolve(middlewares[index](ctx, dispatch.bind(null, index + 1)))
                } catch (err) {
                    return Promise.reject(err);
                }
            }
        }
        return dispatch(0);
    }
}

const autoGenerator = compose(ctx, middlewares);
autoGenerator();