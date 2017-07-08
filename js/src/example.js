import widgets from 'jupyter-js-widgets';
import _ from 'underscore';

export class HelloModel extends widgets.DOMWidgetModel {
    defaults() {
        return {
            ...super.defaults(),
            _model_name : 'HelloModel',
            _view_name : 'HelloView',
            _model_module : 'dfedit',
            _view_module : 'dfedit',
            _model_module_version : '0.1.0',
            _view_module_version : '0.1.0',
            value : 'Hello World'
        }
    }
};


export class HelloView extends widgets.DOMWidgetView {
    render() {
        this.value_changed();
        this.model.on('change:value', this.value_changed, this);
    }

    value_changed() {
        this.el.textContent = this.model.get('value');
    }
};
