
import $ from 'jquery';
import 'select2';

import { expect } from 'chai';
import { DummyManager } from './DummyManager';

import { EqualityFilterModel, EqualityFilterView } from '../../src'

const modelId = 'u-u-i-d';

describe('EqualityFilter#defaults', () => {
    let manager;
    let model;
	beforeEach(() => {
        manager = new DummyManager();
        model = new EqualityFilterModel({}, { model_id: modelId, manager });
	});

    it('construction', () => {
        const options = { model }
        const view = new EqualityFilterView(options);
        view.render();
        const selects = view.$el.find('select');
        expect(selects.length).to.equal(2);
    });
});

describe('EqualityFilter#with_dataframe', () => {
    let manager;
    let model;
    let view;
    const columns = ['first-column', 'second-column', 'third-column']
    const uniqueValues = [['a', 'b'], [1, 2, 3], ['x', 'y', 1]]
    const indexColumnSelected = 0;
    const filterValue = [];

    beforeEach(async () => {
        manager = new DummyManager();
        const attributes = { 
            columns, 
            unique_values: uniqueValues, 
            index_column_selected: indexColumnSelected,
            filter_value: filterValue
        }
        model = new EqualityFilterModel(attributes, { model_id: modelId, manager });
        view = new EqualityFilterView({ model });
        await view.render();
    });

    it('show two selects', () => {
        const selects = view.$el.find('select');
        expect(selects.length).to.equal(2);
    });

    it('have the column names as options to first select', () => {
        const firstSelect = view.$el.find('select')[0];
        const options = $(firstSelect).find('option');
        expect(options.length).to.equal(columns.length);

        options.toArray().map((el, index) => {
            expect(el.getAttribute('value')).to.equal(`${index}`);
            expect(el.text).to.equal(columns[index]);
        });
    });

});
