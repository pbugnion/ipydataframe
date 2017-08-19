import widgets from 'jupyter-js-widgets';

import Slick from './vendor/slickgrid-2.3.6';

class RemoteModel {
    constructor(requestPages) {
        this.pageSize = 1000;
        this.data = {length: 0};
        this._pages = {length: 0};
        this._maxPage = 100; // fixme
        this._requestPages = requestPages
    }

    ensureData(from, to) {
        const fromPage = Math.floor(from / this.pageSize);
        const toPage = Math.floor(to / this.pageSize);
        this._requestPages(fromPage, toPage);
    }

    _requestPages(fromPage, toPage) {
        fromPage = Math.max(fromPage, 0);
        toPage = Math.min(toPage, this._maxPage - 1);

        // avoid reloading data
        while(this._pages[fromPage] !== undefined && fromPage < toPage) fromPage++;
        while(this._pages[toPage] !== undefined && fromPage < toPage) toPage--;

        console.log(`fetching pages ${fromPage} to ${toPage}.`)
        this._fetchPages(fromPage, toPage)
    }

    receiveData(dataMessage) {
        const { pageNumber, rows } = dataMessage
        this._pages[pageNumber] = rows
        this._buildDataFromPages()
    }

    _buildDataFromPages() {
    }
}

export class TabularDataModel extends widgets.DOMWidgetModel {
    static messageTypes = {
        PAGE_RESULT: 'PAGE_RESULT',
    }

    defaults() {
        return {
            ...super.defaults(),
            _model_name: 'DFWidgetModel',
            _view_name: 'DFWidgetView',
            _model_module: 'ipydataframe',
            _view_module: 'ipydataframe',
            _model_module_version: '0.1.0',
            _view_module_version: '0.1.0',
            _columns: [],
            _number_rows: 1000,
            _viewport: [],
            _page_size: null
        }
    }

    initialize(attributes, options) {
        super.initialize(attributes, options);
        this.data = {length: this.get('_number_rows')};
        this.on('msg:custom', (msg) => this.onCustomMessage(msg));
    }

    onCustomMessage(msg) {
        const columns = this.get('_columns');
        if (msg.type === TabularDataModel.messageTypes.PAGE_RESULT) {
            const { startRow, pageData } = msg.payload;
            console.log(`Received page starting at ${startRow}`);
            for(
                let irow = startRow, incomingRow = 0; 
                irow < startRow + pageData.length; 
                irow++, incomingRow++
            ) {
                this.data[irow] = _.object(columns, pageData[incomingRow]);
            }
            this.trigger('data_loaded', { from: startRow, to: startRow + pageData.length });
        }
    }
};

export class TabularDataView extends widgets.DOMWidgetView {
    render() {
        const columns = this.model.get('_columns');
        const slickColumns = columns.map(name => {
            return {id: name, name: name, field: name};
        });

        const options = {
            enableCellNavigation: true,
            enableColumnReorder: false
        };

        this.el.style.width = '600px';
        this.el.style.height = '400px';

        this.el.className += ' ipydataframe-table';

        const grid = new Slick.Grid(this.el, this._getGridData(), slickColumns, options);
        this.listenTo(this.model, 'change:_data', () => {
            grid.setData(this._getGridData());
            grid.render();
        });
        this.listenTo(this.model, 'data_loaded', ({ from, to }) => {
            console.log('data loaded event in view')
            console.log(`from: ${from} to: ${to}`);
            for(let irow = from; irow < to; irow++) {
                grid.invalidateRow(irow);
            }
            grid.updateRowCount();
            grid.render();
        });

        grid.onViewportChanged.subscribe(() => {
            const gridViewport = grid.getViewport();
            const { top, bottom } = gridViewport;
            this.model.set('_viewport', [top, bottom]);
            this.touch();
        });
    }

    _getGridData() {
        return this.model.data;
    }
};

