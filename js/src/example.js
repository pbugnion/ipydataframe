import widgets from 'jupyter-js-widgets';
import _ from 'underscore';

import Slick from './vendor/slickgrid-2.3.6';

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
        const columns = [
            {id: "title", name: "Title", field: "title"},
            {id: "duration", name: "Duration", field: "duration"},
        ];
        const data = [
            {title: "d1", duration: "5 days"},
            {title: "d2", duration: "6 days"}
        ]

        const options = {
            enableCellNavigation: true,
            enableColumnReorder: false
        };

        this.el.style.width = '600px';
        this.el.style.height = '100%';

        this.el.className += ' dfedit-table';

        const grid = new Slick.Grid(this.el, data, columns, options);
    }

};
