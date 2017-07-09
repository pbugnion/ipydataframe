import ipywidgets as widgets
from traitlets import Instance, List, Dict, Unicode, observe

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
