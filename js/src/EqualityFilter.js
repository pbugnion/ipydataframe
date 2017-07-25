import widgets from 'jupyter-js-widgets';
import $ from 'jquery';
import 'select2';

export class EqualityFilterModel extends widgets.DOMWidgetModel {
    defaults() {
        return {
            ...super.defaults(),
            _model_name: 'EqualityFilterModel',
            _view_name: 'EqualityFilterView',
            _model_module: 'ipydataframe',
            _view_module: 'ipydataframe',
            columns: [],
            unique_values: [],
            index_column_selected: null,
            filter_value: []
        }
    }
};

export class EqualityFilterView extends widgets.DOMWidgetView {
    render() {
        this.el.style.width = '600px';
        this.el.style.height = '50px';

        this.$columnsSelect = this._renderColumnsSelect()
        this.$valuesSelect = this._renderOptionsSelect()
    }

    _renderColumnsSelect() {
        const options = this.model.get('columns').map((column, index) => {
            return {
                id: index,
                text: column
            };
        });

        const select = document.createElement('select');
        this.el.appendChild(select);
        const $select = $(select).select2({data: options});
        $select.val(this.model.get('index_column_selected'));
        $select.on('change', e => this._onColumnChange())
        return $select
    }

    _renderOptionsSelect() {
        const options = this._getValueSelectOptions()
        const select = document.createElement('select');
        select.setAttribute('multiple', 'multiple');
        select.style.width = '200px';
        this.el.appendChild(select);
        const $select = $(select)
        this._initializeValueSelect($select, options);
        $select.on('change', e => this._onFilterChange())
        return $select
    }

    _onColumnChange() {
        const options = this._getValueSelectOptions()
        this._initializeValueSelect(this.$valuesSelect, options);
        this.model.set('index_column_selected', parseInt(this.$columnsSelect.val()));
        this.model.set('filter_value', []);
        this.touch();
    }

    _onFilterChange() {
        this.model.set('filter_value', this.$valuesSelect.val());
        this.touch();
    }

    _getValueSelectOptions() {
        const columnSelected = this.$columnsSelect.val();
        let uniqueValues = [];
        if (columnSelected !== null) {
            uniqueValues = this.model.get('unique_values')[columnSelected];
        }
        const options = uniqueValues.map(value => {
            return {
                id: value,
                text: value
            };
        });
        return options;
    }

    _initializeValueSelect($select, options) {
        $select.children('option').remove();
        $select.select2({tags: true, data: options});
    }
}
