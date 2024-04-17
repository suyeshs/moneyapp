// SelectedRangeStore.js
import { observable, action } from "mobx";

// Define a type for the possible values
type RangeType = number | "All";


class SelectedRangeStore {
  // Use the type alias for the property
  @observable selectedRange: RangeType = 3;

  // Use the type alias for the parameter
  // Use the type alias for the parameter
  @action setSelectedRange = (range: RangeType) => {
    this.selectedRange = range;
  };
}

export default new SelectedRangeStore();
