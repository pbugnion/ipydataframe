from ._version import version_info, __version__

from .transformer import *

def _jupyter_nbextension_paths():
    return [{
        'section': 'notebook',
        'src': 'static',
        'dest': 'ipydataframe',
        'require': 'ipydataframe/extension'
    }]
