import widgets from 'jupyter-js-widgets';
import _ from 'underscore';
import $ from 'jquery';
import 'select2';


export class FiltersListModel extends widgets.DOMWidgetModel {
    defaults() {
        return {
            ...super.defaults(),
            _model_name: 'FiltersListModel',
            _view_name: 'FiltersListView',
            _model_module: 'ipydataframe',
            _view_module: 'ipydataframe',
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
            _model_module: 'ipydataframe',
            _view_module: 'ipydataframe',
        }
    }
}

export class TransformationsBoxModel extends widgets.DOMWidgetModel {
    defauts() {
        return {
            ...super.defaults(),
            _model_name: 'TransformationsBoxModel',
            _view_name: 'TransformationsBoxView',
            _model_module: 'ipydataframe',
            _view_module: 'ipydataframe'
        }
    }

    static serializers = {
        ...widgets.DOMWidgetModel.serializers,
        filters_list: {deserialize: widgets.unpack_models},
        new_filter: {deserialize: widgets.unpack_models}
    }
}

export class DFTransformerModel extends widgets.DOMWidgetModel {
    defaults() {
        return {
            ...super.defaults(),
            _model_name: 'DFTransformerModel',
            _view_name: 'DFTransformerView',
            _model_module: 'ipydataframe',
            _view_module: 'ipydataframe'
        }
    }

    static serializers = {
        ...widgets.DOMWidgetModel.serializers,
        dfviewer: {deserialize: widgets.unpack_models},
        transformations_box: {deserialize: widgets.unpack_models}
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

        $select.on('select2:select', (e) => {
            this.send(
                {
                    event: 'select',
                    id: e.params.data.id
                }
            )
        });
    }
}

export class TransformationsBoxView extends widgets.DOMWidgetView {
    async render() {
        const filtersList = await this.create_child_view(this.model.get('filters_list'));
        const newFilter = await this.create_child_view(this.model.get('new_filter'));
        this.el.appendChild(filtersList.el);
        this.el.appendChild(newFilter.el);
    }
}

export class DFTransformerView extends widgets.DOMWidgetView {
    async render() {
        const transformationsBox = await this.create_child_view(
            this.model.get('transformations_box'));
        const dfViewer = await this.create_child_view(this.model.get('dfviewer'));
        this.el.appendChild(transformationsBox.el);
        this.el.appendChild(dfViewer.el);
    }
}
