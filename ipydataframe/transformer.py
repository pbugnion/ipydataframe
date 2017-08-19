import math
import ipywidgets as widgets
from traitlets import (
        Instance, List, Dict, Unicode, observe, Tuple, default, Integer,
        dlink
)

import pandas as pd


class DFViewer(widgets.DOMWidget):
    """"""
    df = Instance(pd.DataFrame)
    _view_name = Unicode('TabularDataView').tag(sync=True)
    _model_name = Unicode('TabularDataModel').tag(sync=True)
    _view_module = Unicode('ipydataframe').tag(sync=True)
    _model_module = Unicode('ipydataframe').tag(sync=True)
    _view_module_version = Unicode('^0.1.0').tag(sync=True)
    _model_module_version = Unicode('^0.1.0').tag(sync=True)
    _columns = List(Unicode()).tag(sync=True)
    _data = List()
    _viewport = List().tag(sync=True)
    _page_size = Integer(default_value=100, allow_none=False).tag(sync=True)

    def __init__(self, df, *args, **kwargs):
        self._df = df
        self._columns = df.columns.tolist()
        self._data = df.values.tolist()
        self._max_page = math.floor(len(self._data) / self._page_size)
        self._pages_sent = set()
        super(DFViewer, self).__init__(*args, **kwargs)
        self.on_msg(
            lambda _, content, buffers: self._handle_custom_message(content)
        )
        self._send_page(0)

    def _handle_custom_message(self, content):
        print(content)
        if content.get('type') == 'SYNC_PAGES':
            for page in self._pages_sent:
                self._send_page(page)

    @observe('df')
    def _update_columns_data(self, change):
        new_df = change['new']
        self._columns = new_df.columns.tolist()
        self._data = new_df.values.tolist()
        self._max_page = math.floor(len(self._data) / self._page_size)

    @observe('_viewport')
    def _update_pages(self, change):
        new_viewport = change['new']
        (from_row, to_row) = new_viewport
        # Ensure we have one page on either side
        # of the current viewport
        from_page = math.floor(from_row / self._page_size) - 1
        from_page = max(0, from_page)
        to_page = math.ceil(to_row / self._page_size) + 1
        to_page = min(self._max_page, to_page)
        while from_page in self._pages_sent and from_page <= to_page:
            from_page += 1
        while to_page in self._pages_sent and from_page <= to_page:
            to_page -= 1
        for page_number in range(from_page, to_page):
            self._send_page(page_number)

    def _send_page(self, page_number):
        print('sending page {}'.format(page_number))
        self._pages_sent.add(page_number)
        from_row = page_number * self._page_size
        to_row = from_row + self._page_size
        page = self._data[from_row:to_row]
        print(len(page))
        self.send({
            'type': 'PAGE_RESULT', 
            'payload': {
                'pageNumber': page_number, 
                'pageData': page, 
                'startRow': from_row
            }
        })



class EqualityFilter(widgets.DOMWidget):
    _view_name = Unicode('EqualityFilterView').tag(sync=True)
    _model_name = Unicode('EqualityFilterModel').tag(sync=True)
    _view_module = Unicode('ipydataframe').tag(sync=True)
    _model_module = Unicode('ipydataframe').tag(sync=True)
    in_df = Instance(pd.DataFrame)
    out_df = Instance(pd.DataFrame)
    columns = List(Unicode()).tag(sync=True)
    unique_values = List().tag(sync=True)
    index_column_selected = Integer(allow_none=True).tag(sync=True)
    filter_value = List().tag(sync=True)

    def __init__(self, df, *args, **kwargs):
        self._set_traits(df)
        super(EqualityFilter, self).__init__(*args, **kwargs)

    @observe('index_column_selected')
    def _on_index_change(self, change):
        self._update_out_df()

    @observe('filter_value')
    def _on_filter_change(self, change):
        self._update_out_df()

    def _set_traits(self, df):
        self.in_df = df
        self.out_df = df
        self.columns = df.columns.tolist()
        self.unique_values = self._calculate_unique_sample(df)
        if len(self.columns):
            self.index_column_selected = 0
        else:
            self.index_column_selected = None
        self.filter_value = []

    def _calculate_unique_sample(self, df):
        n = min(df.shape[0], 100)
        sample_df = df.sample(n=n)
        return [s.unique().tolist() for (_, s) in sample_df.items()]

    def _update_out_df(self):
        column = self.in_df.columns[self.index_column_selected]
        self.out_df = self._calculate_transformation(
                self.in_df, column, self.filter_value)

    def _calculate_transformation(self, df, column, filter_value):
        if not filter_value:
            out_df = df
        else:
            out_df = df[df[column].isin(filter_value)]
        return out_df


class FiltersList(widgets.DOMWidget):
    _view_name = Unicode('FiltersListView').tag(sync=True)
    _model_name = Unicode('FiltersListModel').tag(sync=True)
    _view_module = Unicode('ipydataframe').tag(sync=True)
    _model_module = Unicode('ipydataframe').tag(sync=True)
    children = Tuple(help="List of widget children").tag(
            sync=True, **widgets.widget_serialization)
    in_df = Instance(pd.DataFrame)
    out_df = Instance(pd.DataFrame)

    def __init__(self, df, *args, **kwargs):
        self.in_df = df
        super(FiltersList, self).__init__(*args, **kwargs)
        self.in_df_link = dlink((self, 'in_df'), (self, 'out_df'))
        self.out_df_link = None

    def add_transformation(self, transformation_id):
        try:
            last_child = self.children[-1]
        except IndexError:
            new_transformation = TRANSFORMATION_IDS[transformation_id](self.in_df)
            self.children = [new_transformation]
            self.out_df = new_transformation.out_df
            self.in_df_link.unlink()
            self.in_df_link = dlink((self, 'in_df'), (new_transformation, 'in_df'))
            self.out_df_link = dlink((new_transformation, 'out_df'), (self, 'out_df'))


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
        'keywords-filter': EqualityFilter,
        'other-filter': EqualityFilter
}

class NewFilter(widgets.DOMWidget):
    _view_name = Unicode('NewFilterView').tag(sync=True)
    _model_name = Unicode('NewFilterModel').tag(sync=True)
    _view_module = Unicode('ipydataframe').tag(sync=True)
    _model_module = Unicode('ipydataframe').tag(sync=True)
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
    _view_module = Unicode('ipydataframe').tag(sync=True)
    _model_module = Unicode('ipydataframe').tag(sync=True)
    filters_list = Instance(FiltersList).tag(sync=True, **widgets.widget_serialization)
    new_filter = Instance(NewFilter).tag(sync=True, **widgets.widget_serialization)
    out_df = Instance(pd.DataFrame)

    def __init__(self, df, *args, **kwargs):
        self.filters_list = FiltersList(df)
        self.new_filter = NewFilter()
        self.out_df = df
        super(TransformationsBox, self).__init__(*args, **kwargs)
        self.new_filter.register_new_filter_callback(self.add_filter)
        dlink((self.filters_list, 'out_df'), (self, 'out_df'))

    def add_filter(self, filter_id):
        self.filters_list.add_transformation(filter_id)


class DFTransformer(widgets.DOMWidget):
    _view_name = Unicode('DFTransformerView').tag(sync=True)
    _model_name = Unicode('DFTransformerModel').tag(sync=True)
    _view_module = Unicode('ipydataframe').tag(sync=True)
    _model_module = Unicode('ipydataframe').tag(sync=True)
    dfviewer = Instance(DFViewer).tag(
            sync=True, **widgets.widget_serialization)
    transformations_box = Instance(TransformationsBox).tag(
            sync=True, **widgets.widget_serialization)

    def __init__(self, df, *args, **kwargs):
        self.dfviewer = DFViewer(df)
        self.transformations_box = TransformationsBox(df)
        super(DFTransformer, self).__init__(*args, **kwargs)
        dlink((self.transformations_box, 'out_df'), (self.dfviewer, 'df'))
