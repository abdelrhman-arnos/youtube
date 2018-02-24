'use strict';

browser.ignoreSynchronization = true;
browser.waitForAngular();
browser.sleep(500);

let searchpage = require('./search/searchpage');

describe('youtube app', () => {

    describe('Access search section', () => {
        it('Should be able to search', () => {
            const search = 'car';

            browser.get('index.html');
            searchpage.searchInput(search);
            searchpage.searchBtn.click();
            expect(browser.getCurrentUrl()).toContain(`query=${search}`);
        });

        xdescribe('Access filter section', () => {
            beforeEach(() => {
                searchpage.openFilter();
                expect(searchpage.filterContainer.isDisplayed);
            });

            it('Should update search result when filter by type', () => {
                // type: video, channel and playlist
                const type = 'channel';
                // date: hour, today, week, month and year
                const date = 'week';

                searchpage.filterOption(type);
                expect(browser.getCurrentUrl()).toContain(`type=${type}`);

                // can't select date filter when choosing channel and playlist
                if(type !== 'video'){
                    expect($(`[data-value="${date}"]`).getAttribute('class')).toContain('--disabled');
                }
                browser.sleep(5000);
            });

            it('Should update search result when filter by sort', () => {
                // sort: relevance, date, viewCount and rating
                const sort = 'viewCount';

                searchpage.filterOption(sort);
                expect(browser.getCurrentUrl()).toContain(`sort=${sort}`);
            });

            it('Should update search result when filter by upload date', () => {
                // date: hour, today, week, month and year
                const date = 'hour';

                searchpage.filterOption(date);
                expect(browser.getCurrentUrl()).toContain(`date=${date}`);
            });
        });

        describe('Access search result elements', () => {
            beforeEach(() => {
                searchpage.openFilter();
                expect(searchpage.filterContainer.isDisplayed);
            });

            it('Should be open the element where the type', () => {
                // type: video, channel and playlist
                const type = 'video';
                const element = searchpage.searchResultItem(type);
                let elementId = 0;

                searchpage.filterOption(type);
                expect(browser.getCurrentUrl()).toContain(`type=${type}`);
                browser.sleep(5000);

                element.getAttribute('data-value');
                element.click();
                expect(browser.getCurrentUrl()).toContain(elementId);
            });
        });
    });
});
