export const customSelectStyles = {
  control: (provided, state) => ({
    ...provided,
    minHeight: "38px",
    height: "38px",
    border: "1px solid #ced4da",
    borderRadius: "0.375rem",
    boxShadow: state.isFocused ? "0 0 0 0.2rem rgba(13,110,253,.25)" : "none",
    "&:hover": {
      borderColor: "#86b7fe",
    },
  }),
  valueContainer: (provided) => ({
    ...provided,
    height: "38px",
    padding: "0 8px",
  }),
  input: (provided) => ({
    ...provided,
    margin: "0px",
  }),
  indicatorsContainer: (provided) => ({
    ...provided,
    height: "38px",
  }),
  placeholder: (provided) => ({
    ...provided,
    color: "#6c757d",
  }),
};
