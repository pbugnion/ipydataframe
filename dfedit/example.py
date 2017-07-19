import ipywidgets as widgets
from traitlets import Instance, List, Dict, Unicode, observe, Tuple, default

import pandas as pd


class DFViewer(widgets.DOMWidget):
    """"""
    df = Instance(pd.DataFrame)
    _view_name = Unicode('DFWidgetView').tag(sync=True)
    _model_name = Unicode('DFWidgetModel').tag(sync=True)
    _view_module = Unicode('dfedit').tag(sync=True)
    _model_module = Unicode('dfedit').tag(sync=True)
    _view_module_version = Unicode('^0.1.0').tag(sync=True)
    _model_module_version = Unicode('^0.1.0').tag(sync=True)
    _columns = List(Unicode()).tag(sync=True)
    _data = List().tag(sync=True)

    def __init__(self, df, *args, **kwargs):
        self._df = df
        self._columns = df.columns.tolist()
        self._data = df.values.tolist()
        super(DFViewer, self).__init__(*args, **kwargs)

    @observe('df')
    def _update_columns_data(self, change):
        new_df = change['new']
        self._columns = new_df.columns.tolist()
        self._data = new_df.values.tolist()


class StringsFilter(widgets.DOMWidget):
    _view_name = Unicode('StringsFilterView').tag(sync=True)
    _model_name = Unicode('StringsFilterModel').tag(sync=True)
    _view_module = Unicode('dfedit').tag(sync=True)
    _model_module = Unicode('dfedit').tag(sync=True)
    _df = Instance(pd.DataFrame)
    _columns = List(Unicode()).tag(sync=True)

    def __init__(self, df, *args, **kwargs):
        self.df = df
        self._columns = df.columns.tolist()
        super(StringsFilter, self).__init__(*args, **kwargs)

    @observe('df')
    def _update_columns(self, change):
        new_df = change['new']
        self._columns = new_df.columns.tolist()


class FiltersList(widgets.DOMWidget):
    _view_name = Unicode('FiltersListView').tag(sync=True)
    _model_name = Unicode('FiltersListModel').tag(sync=True)
    _view_module = Unicode('dfedit').tag(sync=True)
    _model_module = Unicode('dfedit').tag(sync=True)
    children = Tuple(help="List of widget children").tag(
            sync=True, **widgets.widget_serialization)

    def add_transformation(self, transformation):
        new_children = list(self.children) + [transformation]
        self.children = new_children


class Transformation(object):
    def __init__(self, transformation_id, name, description):
        self.transformation_id = transformation_id
        self.name = name
        self.description = description

    def to_json(self):
        body = {
                'transformationId': self.transformation_id,
                'name': self.name,
                'description': self.description
        }
        return body

transformation_serializers = {
        'from_json': None,
        'to_json': lambda transformations, _: [t.to_json() for t in transformations]
}

TRANSFORMATIONS = [
        Transformation('other-filter', 'Other filter', 'bla bla bla'),
        Transformation('keywords-filter', 'Keywords filter', 'bla bla bla')
]

TRANSFORMATION_IDS = {
        'keywords-filter': StringsFilter,
        'other-filter': StringsFilter
}

class NewFilter(widgets.DOMWidget):
    _view_name = Unicode('NewFilterView').tag(sync=True)
    _model_name = Unicode('NewFilterModel').tag(sync=True)
    _view_module = Unicode('dfedit').tag(sync=True)
    _model_module = Unicode('dfedit').tag(sync=True)
    transformations = List(Instance(Transformation),
            default_value=TRANSFORMATIONS).tag(
                    sync=True, **transformation_serializers)

    def __init__(self, *args, **kwargs):
        super(NewFilter, self).__init__(*args, **kwargs)
        self._new_filter_callbacks = []
        self.on_msg(self._handle_message)

    def _handle_message(self, _1, content, _2):
        if content.get('event') == 'select':
            filter_id = content['id']
            for callback in self._new_filter_callbacks:
                callback(filter_id)

    def register_new_filter_callback(self, callback):
        self._new_filter_callbacks.append(callback)


class TransformationsBox(widgets.DOMWidget):
    _view_name = Unicode('TransformationsBoxView').tag(sync=True)
    _model_name = Unicode('TransformationsBoxModel').tag(sync=True)
    _view_module = Unicode('dfedit').tag(sync=True)
    _model_module = Unicode('dfedit').tag(sync=True)
    filters_list = Instance(FiltersList).tag(sync=True, **widgets.widget_serialization)
    new_filter = Instance(NewFilter).tag(sync=True, **widgets.widget_serialization)

    def __init__(self, df, *args, **kwargs):
        self.df = df
        super(TransformationsBox, self).__init__(*args, **kwargs)
        self.new_filter.register_new_filter_callback(self.add_filter)

    @default('filters_list')
    def _default_filters_list(self):
        return FiltersList()

    @default('new_filter')
    def _default_new_filter(self):
        return NewFilter()

    def add_filter(self, filter_id):
        print('adding filter {}'.format(filter_id))
        transformation = TRANSFORMATION_IDS[filter_id](self.df)
        self.filters_list.add_transformation(transformation)


class DFTransformer(widgets.DOMWidget):
    _view_name = Unicode('DFTransformerView').tag(sync=True)
    _model_name = Unicode('DFTransformerModel').tag(sync=True)
    _view_module = Unicode('dfedit').tag(sync=True)
    _model_module = Unicode('dfedit').tag(sync=True)
    dfviewer = Instance(DFViewer).tag(
            sync=True, **widgets.widget_serialization)
    transformations_box = Instance(TransformationsBox).tag(
            sync=True, **widgets.widget_serialization)

    def __init__(self, df, *args, **kwargs):
        self.dfviewer = DFViewer(df)
        self.transformations_box = TransformationsBox(df)
        super(DFTransformer, self).__init__(*args, **kwargs)
