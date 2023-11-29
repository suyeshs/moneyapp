import React from 'react';
import './GridComponent.css';

type ColumnDirectiveProps = {
  field?: string;
  headerText: string;
  headerTextAlign?: "left" | "center" | "right";
  template?: (data: any) => React.ReactNode;
};

type GridRowProps = {
  columns: ColumnDirectiveProps[];
  data: any;
  enableHover: boolean;
  rowDataBound?: (data: any) => boolean; // Optional prop to determine if the row has special styling
};

const ColumnDirectiveComponent: React.FC<ColumnDirectiveProps> = () => null;

type GridComponentProps = {
  dataSource: any[];
  enableHover?: boolean;
  allowSelection?: boolean;
  enableStickyHeader?: boolean;
  cssClass?: string;
  children: React.ReactNode;
  rowDataBound?: (data: any) => boolean; // Optional prop for row-specific styling logic
};

export const DataGridComponent: React.FC<GridComponentProps> = ({
  dataSource,
  enableHover = false,
  allowSelection = false,
  enableStickyHeader = false,
  cssClass,
  children,
  rowDataBound, // Accept rowDataBound as a prop
}) => {
  const columns: ColumnDirectiveProps[] = React.Children.toArray(children)
    .filter(React.isValidElement)
    .filter(child => child.type === ColumnDirectiveComponent)
    .map(child => child.props) as ColumnDirectiveProps[];

  const GridRow: React.FC<GridRowProps> = ({ columns, data, enableHover, rowDataBound }) => {
    // Determine if the row should have special styling based on rowDataBound
    const isRowSpecial = rowDataBound ? rowDataBound(data) : false;

    return (
      <tr className={`${enableHover ? "hoverable" : ""} ${isRowSpecial ? "special-row-class" : ""}`}>
        {columns.map((column, colIndex) => {
          let content: React.ReactNode;
          if (column.field) {
            const fields = column.field.split('.');
            let value: any = data;
            for (let field of fields) {
              if (value == null) break;
              value = value[field];
            }
            content = value !== undefined && value !== null ? value : '-';
          }
          if (column.template) {
            content = column.template(data);
          }
          return <td key={colIndex} style={{ textAlign: column.headerTextAlign || 'left' }}>{content}</td>;
        })}
      </tr>
    );
  };

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
          {dataSource && dataSource.length > 0 ? (
            dataSource.map((item, rowIndex) => (
              <MemoizedGridRow
                key={rowIndex}
                columns={columns}
                data={item}
                enableHover={enableHover}
                rowDataBound={rowDataBound} // Pass rowDataBound down to GridRow
              />
            ))
          ) : (
            <tr><td colSpan={columns.length}>No data available</td></tr>
          )}
        </tbody>
      </table>
    </div>
  );
};
export default DataGridComponent;

export { ColumnDirectiveComponent as ColumnDirective };

