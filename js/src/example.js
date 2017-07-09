import widgets from 'jupyter-js-widgets';
import _ from 'underscore';
import $ from 'jquery';
import 'select2';

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

export class StringsFilterModel extends widgets.DOMWidgetModel {
    defaults() {
        return {
            ...super.defaults(),
            _model_name: 'StringFilter',
            _view_name: 'StringFilterView',
            _column: null,
            filterValue: []
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

export class StringsFilterView extends widgets.DOMWidgetView {
    render() {
        const options = ['hello', 'world', 'lapha', 'beta'];
        const select = document.createElement('select');
        select.setAttribute('multiple', 'multiple');

        const optionElements = options.forEach(optionValue => {
            const elem = document.createElement('option');
            elem.text = optionValue;
            elem.setAttribute('value', optionValue);
            select.appendChild(elem);
        });


        this.el.style.width = '600px';
        this.el.style.height = '400px';

        this.el.appendChild(select);
        $(select).select2({tags: true});
    }
}
