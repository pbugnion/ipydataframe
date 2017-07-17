import ipywidgets as widgets
from traitlets import Instance, List, Dict, Unicode, observe, Tuple

import pandas as pd


@widgets.register('hello.Hello')
class HelloWorld(widgets.DOMWidget):
    """"""
    df = Instance(pd.DataFrame)
    _view_name = Unicode('HelloView').tag(sync=True)
    _model_name = Unicode('HelloModel').tag(sync=True)
    _view_module = Unicode('dfedit').tag(sync=True)
    _model_module = Unicode('dfedit').tag(sync=True)
    _view_module_version = Unicode('^0.1.0').tag(sync=True)
    _model_module_version = Unicode('^0.1.0').tag(sync=True)
    _columns = List(Unicode()).tag(sync=True)
    _data = List().tag(sync=True)

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


class FiltersList(widgets.DOMWidget):
    _view_name = Unicode('FiltersListView').tag(sync=True)
    _model_name = Unicode('FiltersListModel').tag(sync=True)
    _view_module = Unicode('dfedit').tag(sync=True)
    _model_module = Unicode('dfedit').tag(sync=True)
    children = Tuple(help="List of widget children").tag(
            sync=True, **widgets.widget_serialization)


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
        Transformation('keywords-filter', 'Keywords filter', 'bla bla bla')
]

class NewFilter(widgets.DOMWidget):
    _view_name = Unicode('NewFilterView').tag(sync=True)
    _model_name = Unicode('NewFilterModel').tag(sync=True)
    _view_module = Unicode('dfedit').tag(sync=True)
    _model_module = Unicode('dfedit').tag(sync=True)
    transformations = List(Instance(Transformation),
            default_value=TRANSFORMATIONS).tag(
                    sync=True, **transformation_serializers)

