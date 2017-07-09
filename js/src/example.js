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
            _columns: [],
            _data: []
        }
    }
};


export class HelloView extends widgets.DOMWidgetView {
    render() {
        const columns = this.model.get('_columns');
        const slickColumns = columns.map(name => {
            return {id: name, name: name, field: name};
        });
        const slickData = this.model.get('_data').map(row => {
            return _.object(columns, row);
        });

        const options = {
            enableCellNavigation: true,
            enableColumnReorder: false
        };

        this.el.style.width = '600px';
        this.el.style.height = '400px';

        this.el.className += ' dfedit-table';

        const grid = new Slick.Grid(this.el, slickData, slickColumns, options);
    }

};
