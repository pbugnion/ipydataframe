import widgets from 'jupyter-js-widgets';

import Slick from './vendor/slickgrid-2.3.6';

export class DFWidgetModel extends widgets.DOMWidgetModel {
    defaults() {
        return {
            ...super.defaults(),
            _model_name: 'DFWidgetModel',
            _view_name: 'DFWidgetView',
            _model_module: 'ipydataframe',
            _view_module: 'ipydataframe',
            _model_module_version: '0.1.0',
            _view_module_version: '0.1.0',
            _columns: [],
            _data: []
        }
    }
};

export class DFWidgetView extends widgets.DOMWidgetView {
    render() {
        const columns = this.model.get('_columns');
        const slickColumns = columns.map(name => {
            return {id: name, name: name, field: name};
        });

        const options = {
            enableCellNavigation: true,
            enableColumnReorder: false
        };

        this.el.style.width = '600px';
        this.el.style.height = '400px';

        this.el.className += ' ipydataframe-table';

        const grid = new Slick.Grid(this.el, this._getGridData(), slickColumns, options);
        this.listenTo(this.model, 'change:_data', () => {
            grid.setData(this._getGridData());
            grid.render();
        });
    }

    _getGridData() {
        const columns = this.model.get('_columns');
        return this.model.get('_data').map(row => {
            return _.object(columns, row);
        });
    }
};

