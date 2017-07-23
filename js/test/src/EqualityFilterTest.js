
import { expect } from 'chai';
import { DummyManager } from './DummyManager';

const modelId = 'u-u-i-d';

describe('EqualityFilter', () => {
    let manager;
    let model;
	beforeEach(async () => {
        manager = new DummyManager();
        model = await manager.new_model({
            model_name: 'EqualityFilterModel',
            model_module: 'ipydataframe',
            model_id: modelId
        });
	});

    it('hello world', () => console.error(model));
});
