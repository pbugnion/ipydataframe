ipydataframe
============

Transform dataframes interactively in Jupyter notebooks

This is not suitable for widespread consumption yet.

Installation
------------

To install use pip:

    $ pip install ipydataframe
    $ jupyter nbextension enable --py --sys-prefix ipydataframe


For a development installation (requires npm),

    $ git clone https://github.com/pbugnion/ipydataframe.git
    $ cd ipydataframe
    $ pip install -e .
    $ jupyter nbextension install --py --symlink --sys-prefix ipydataframe
    $ jupyter nbextension enable --py --sys-prefix ipydataframe
