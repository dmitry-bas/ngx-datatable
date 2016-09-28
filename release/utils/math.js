"use strict";
var column_1 = require('./column');
/**
 * Calculates the Total Flex Grow
 * @param {array}
 */
function getTotalFlexGrow(columns) {
    var totalFlexGrow = 0;
    for (var _i = 0, columns_1 = columns; _i < columns_1.length; _i++) {
        var c = columns_1[_i];
        totalFlexGrow += c.flexGrow || 0;
    }
    return totalFlexGrow;
}
exports.getTotalFlexGrow = getTotalFlexGrow;
/**
 * Adjusts the column widths.
 * Inspired by: https://github.com/facebook/fixed-data-table/blob/master/src/FixedDataTableWidthHelper.js
 * @param {array} all columns
 * @param {int} width
 */
function adjustColumnWidths(allColumns, expectedWidth) {
    var columnsWidth = column_1.columnsTotalWidth(allColumns);
    var totalFlexGrow = getTotalFlexGrow(allColumns);
    var colsByGroup = column_1.columnsByPin(allColumns);
    if (columnsWidth !== expectedWidth) {
        scaleColumns(colsByGroup, expectedWidth, totalFlexGrow);
    }
}
exports.adjustColumnWidths = adjustColumnWidths;
/**
 * Resizes columns based on the flexGrow property, while respecting manually set widths
 * @param {array} colsByGroup
 * @param {int} maxWidth
 * @param {int} totalFlexGrow
 */
function scaleColumns(colsByGroup, maxWidth, totalFlexGrow) {
    // calculate total width and flexgrow points for coulumns that can be resized
    for (var attr in colsByGroup) {
        for (var _i = 0, _a = colsByGroup[attr]; _i < _a.length; _i++) {
            var column = _a[_i];
            if (!column.canAutoResize) {
                maxWidth -= column.width;
                totalFlexGrow -= column.flexGrow;
            }
            else {
                column.width = 0;
            }
        }
    }
    var hasMinWidth = {};
    var remainingWidth = maxWidth;
    // resize columns until no width is left to be distributed
    do {
        var widthPerFlexPoint = remainingWidth / totalFlexGrow;
        remainingWidth = 0;
        for (var attr in colsByGroup) {
            for (var _b = 0, _c = colsByGroup[attr]; _b < _c.length; _b++) {
                var column = _c[_b];
                // if the column can be resize and it hasn't reached its minimum width yet
                if (column.canAutoResize && !hasMinWidth[column.prop]) {
                    var newWidth = column.width + column.flexGrow * widthPerFlexPoint;
                    if (column.minWidth !== undefined && newWidth < column.minWidth) {
                        remainingWidth += newWidth - column.minWidth;
                        column.width = column.minWidth;
                        hasMinWidth[column.prop] = true;
                    }
                    else {
                        column.width = newWidth;
                    }
                }
            }
        }
    } while (remainingWidth !== 0);
}
/**
 * Forces the width of the columns to
 * distribute equally but overflowing when nesc.
 *
 * Rules:
 *
 *  - If combined withs are less than the total width of the grid,
 *    proporation the widths given the min / max / noraml widths to fill the width.
 *
 *  - If the combined widths, exceed the total width of the grid,
 *    use the standard widths.
 *
 *  - If a column is resized, it should always use that width
 *
 *  - The proporational widths should never fall below min size if specified.
 *
 *  - If the grid starts off small but then becomes greater than the size ( + / - )
 *    the width should use the orginial width; not the newly proporatied widths.
 *
 * @param {array} allColumns
 * @param {int} expectedWidth
 */
function forceFillColumnWidths(allColumns, expectedWidth, startIdx) {
    var contentWidth = 0;
    var columnsToResize = startIdx > -1 ?
        allColumns.slice(startIdx, allColumns.length).filter(function (c) { return c.canAutoResize; }) :
        allColumns.filter(function (c) { return c.canAutoResize; });
    for (var _i = 0, allColumns_1 = allColumns; _i < allColumns_1.length; _i++) {
        var column = allColumns_1[_i];
        if (!column.canAutoResize) {
            contentWidth += column.width;
        }
        else {
            contentWidth += (column.$$oldWidth || column.width);
        }
    }
    var remainingWidth = expectedWidth - contentWidth;
    var additionWidthPerColumn = remainingWidth / columnsToResize.length;
    var exceedsWindow = contentWidth > expectedWidth;
    for (var _a = 0, columnsToResize_1 = columnsToResize; _a < columnsToResize_1.length; _a++) {
        var column = columnsToResize_1[_a];
        if (exceedsWindow) {
            column.width = column.$$oldWidth || column.width;
        }
        else {
            if (!column.$$oldWidth) {
                column.$$oldWidth = column.width;
            }
            var newSize = column.$$oldWidth + additionWidthPerColumn;
            if (column.minWith && newSize < column.minWidth) {
                column.width = column.minWidth;
            }
            else if (column.maxWidth && newSize > column.maxWidth) {
                column.width = column.maxWidth;
            }
            else {
                column.width = newSize;
            }
        }
    }
}
exports.forceFillColumnWidths = forceFillColumnWidths;
//# sourceMappingURL=math.js.map