import widgets from 'jupyter-js-widgets';

import * as ipydataframeWidgets from '../../src';

export class MockComm {
	on_close() {}
	on_msg() {}
	close() {}
}

export class DummyManager extends widgets.ManagerBase {
	constructor() {
		super();
		this.el = window.document.createElement('div');
	}

	display_view(msg, view, options) {
		return Promise.resolve(view).then(view => {
			this.el.appendChild(view.el);
			view.on('remove', () => console.log('view removed', view));
			return view.el;
		});
	}

    loadClass(className, moduleName, moduleVersion) {
        if (moduleName === 'ipydataframe') {
            console.error('in module');
            if (ipydataframeWidgets[className]) {
                return Promise.resolve(ipydataframeWidgets[className]);
            }
            else {
                return Promise.reject(`Cannot find class ${className}`)
            }
        }
        else {
            return Promise.reject(`Unknown module ${moduleName}`);
        }
    }

	_get_comm_info() {
		return Promise.resolve({});
	}

	_create_comm() {
		return Promise.resolve(new MockComm());
	}
}
