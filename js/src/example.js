import widgets from 'jupyter-js-widgets';
import _ from 'underscore';
import $ from 'jquery';
import 'select2';

import Slick from './vendor/slickgrid-2.3.6';

export class HelloModel extends widgets.DOMWidgetModel {
    defaults() {
        return {
            ...super.defaults(),
            _model_name: 'HelloModel',
            _view_name: 'HelloView',
            _model_module: 'dfedit',
            _view_module: 'dfedit',
            _model_module_version: '0.1.0',
            _view_module_version: '0.1.0',
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
            _model_module: 'dfedit',
            _view_module: 'dfedit',
            _column: null,
            filterValue: []
        }
    }
};


export class FiltersListModel extends widgets.VBoxModel {
    defaults() {
        return {
            ...super.defaults(),
            _model_name: 'StringFilter',
            _view_name: 'StringFilterView',
            _model_module: 'dfedit',
            _view_module: 'dfedit',
            children: [],
            box_style: ''
        }
    }
}

export class NewFilterModel extends widgets.DOMWidgetModel {
    defaults() {
        return {
            ...super.defaults(),
            _model_name: 'NewFiltersModel',
            _view_name: 'NewFiltersView',
            _model_module: 'dfedit',
            _view_module: 'dfedit',
        }
    }
}

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
        this.el.style.width = '600px';
        this.el.style.height = '400px';

        this._renderColumnsSelect()
        this._renderOptionsSelect()
    }

    _renderColumnsSelect() {
        const options = ['c1', 'c2', 'c3', 'c4'];
        const select = document.createElement('select');

        const optionElements = options.forEach(optionValue => {
            const elem = document.createElement('option');
            elem.text = optionValue;
            elem.setAttribute('value', optionValue);
            select.appendChild(elem);
        });
        this.el.appendChild(select);
        $(select).select2();
    }

    _renderOptionsSelect() {
        const options = ['hello', 'world', 'alpha', 'beta'];
        const select = document.createElement('select');
        select.setAttribute('multiple', 'multiple');

        const optionElements = options.forEach(optionValue => {
            const elem = document.createElement('option');
            elem.text = optionValue;
            elem.setAttribute('value', optionValue);
            select.appendChild(elem);
        });
        this.el.appendChild(select);
        $(select).select2({tags: true});
    }
}

export class FiltersListView extends widgets.VBoxView {};

export class NewFilterView extends widgets.DOMWidgetView {
    render() {
        const transformations = this.model.get('transformations')
        const selectOptions = transformations.map(t => {
            return {
                id: t.transformationId,
                text: t.name
            };
        })

        const select = document.createElement('select');
        this.el.appendChild(select);
        const $select = $(select).select2({data: selectOptions});

        $select.on("select2:select", (e) => {
            console.log(e.params.data.id)
            this.send(
                {
                    event: 'select',
                    id: e.params.data.id
                }
            )
        });
    }
}
