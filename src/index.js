window.IframeCommunication = {
    _listener: null, // 监听器存储
    _callbacks: [], // 回调函数容器
    /**
     * 链式构造回调函数
     * @param {Function} fn 回调函数
     * @returns
     */
    then(fn) {
        this._callbacks.push(fn);

        return this;
    },
    /**
     * 给 父iframe 发送消息
     * @param {any} message 消息
     * @param {string} targetOrigin 域
     * @returns
     */
    emit(message, targetOrigin = window.location.origin) {
        window.parent.postMessage(message, targetOrigin);

        return this;
    },
    /**
     * 给 子iframe 发送消息
     * @param {any} message 消息
     * @param {string} targetOrigin 域
     * @param {string} selector querySelector 选择器
     * @returns
     */
    props(message, targetOrigin = window.location.origin, selector = 'iframe') {
        try {
            const iframe = document.querySelector(selector);

            iframe.contentWindow.postMessage(message, targetOrigin);
        } catch (e) {
            console.error(
                'iframe-communication: 未找到 ' + selector + ' iframe.'
            );
        }

        return this;
    },
    /**
     * 挂在
     * @returns
     */
    $mount() {
        var that = this;

        if (!this._listener) {
            that._listener = function (event) {
                let prev = event;
                let fns = that._callbacks.slice();

                for (let i = 0, l = fns.length; i < l; i++) {
                    prev = fns[i].call(that, prev);
                }
            };

            window.addEventListener('message', that._listener, false);

            window.IFRAME_COMMUNICATION = this;
        }

        return this;
    },
    /**
     * 销毁接收通道
     */
    destory() {
        window.removeEventListener('message', this._listener);
        this._listener = null;
        window.IFRAME_COMMUNICATION = null;

        delete window.IFRAME_COMMUNICATION;
    },
    /**
     * 是否为顶级窗口
     * @returns
     */
    isTop() {
        return window.self === window.top;
    },
};
