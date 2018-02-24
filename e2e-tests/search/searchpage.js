let searchpage = function () {
    this.searchBtn = $('.search__button');
    this.filterContainer = $('.filter__container');
    this.filter = $('.filter__button');
    this.maxResult = 10; // default

    /**
     *
     * @type take component type and select first element type ex: video, channel and playlist
     */
    this.searchResultItem = type => {
        return $$(`.${type}_comp a[data-type="${type}"]`).get(0);
    };

    /**
     *
     * @value value your search word
     */
    this.searchInput = value => {
        element(by.id('search__input--desktop')).sendKeys(value)
    };

    this.openFilter = () => {
        this.filter.isPresent().then(() => {
            this.filter.click();
        })
    };

    /**
     *
     * @type take filter type
     * ex: video, channel and playlist,
     *     relevance, date, viewCount and rating,
     *     hour, today, week, month and year
     */
    this.filterOption = type => {
        $(`[data-value="${type}"]`).click();
    };

    /**
     *
     * @type take render type in repeater('item in search.items')
     */
    this.checkTypeCount = type => {
        let countOfItems = $$(`${type}-render`).count().then((num) => {
            return num;
        });
        expect(countOfItems).toBe(this.maxResult);
    };
};
module.exports = new searchpage();