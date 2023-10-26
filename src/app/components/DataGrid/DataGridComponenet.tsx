import React, { ReactNode } from 'react';
import './GridComponent.css'; // Assuming you have a separate CSS file
import { CombinedStockData } from '../../../types'; // adjust the path based on where you keep the StockTypes.ts file

// ColumnDirective Props
type ColumnDirectiveProps = {
  field: string;
  headerText: string;
  headerTextAlign?: "left" | "center" | "right";
};

type GridRowProps = {
  columns: ColumnDirectiveProps[];
  data: CombinedStockData;
  enableHover: boolean;
};

export const ColumnDirective: React.FC<ColumnDirectiveProps> = () => null; // This component just holds metadata and doesn't render anything directly.

// GridComponent Props
type GridComponentProps = {
  dataSource: CombinedStockData[]; // Ensure you have defined or imported the CombinedStockData type
  enableHover?: boolean;
  allowSelection?: boolean;
  enableStickyHeader?: boolean;
  cssClass?: string;
  children?: React.ReactNode;  // Add this line
};

// A utility function to check if a value is a valid React child
function isValidReactChild(value: any): value is ReactNode {
  return (
    typeof value === 'string' ||
    typeof value === 'number' ||
    React.isValidElement(value)
  );
}

const columns: ColumnDirectiveProps[] = [
    { field: 'ltp', headerText: 'LTP', headerTextAlign: 'center' },
    { field: 'last_traded_time', headerText: 'Last Traded Time', headerTextAlign: 'center' },
    { field: 'OI', headerText: 'Open Interest', headerTextAlign: 'center' },
    { field: 'volume', headerText: 'Volume', headerTextAlign: 'center' },
    { field: 'change_in_OI', headerText: 'Change in OI', headerTextAlign: 'center' },
    { field: "strikePrice", headerText: "Strike Price", headerTextAlign: 'center' },
    { field: "OptionType", headerText: "Option Type", headerTextAlign: 'center'}
  ];

export const GridComponent: React.FC<GridComponentProps> = ({
  dataSource,
  enableHover = false,
  allowSelection = false,
  enableStickyHeader = false,
  cssClass,
  children,
}) => {
    //console.log('In grid componenet',dataSource);  // Log the data source to check its structure

  const GridRow: React.FC<GridRowProps> = ({ columns, data, enableHover }) => {
    //console.log('Data in the grid',data); // Log the entire data object

    return (
      <tr className={enableHover ? "hoverable" : ""}>
        {columns.map((column, colIndex) => {
          const fields = column.field.split('.');
          let value: any = data;
          for (let field of fields) {
            if (value == null) break;
            value = value[field];
          }
          const content = isValidReactChild(value) ? value : '-';
          return <td key={colIndex} style={{ textAlign: column.headerTextAlign || 'left' }}>{content}</td>;
        })}
      </tr>
    );
  };

  // Memoize GridRow for better performance.
  const MemoizedGridRow = React.memo(GridRow);

  return (
    <div className={`grid-container ${cssClass || ""}`}>
      <table className={enableStickyHeader ? "sticky-header" : ""}>
        <thead>
          <tr>
            {columns.map((column, index) => (
              <th key={index} style={{ textAlign: column.headerTextAlign || 'left' }}>
                {column.headerText}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {dataSource.map((item, rowIndex) => (
            <MemoizedGridRow key={rowIndex} columns={columns} data={item} enableHover={enableHover} />
          ))}
        </tbody>
      </table>
    </div>
  );
};
