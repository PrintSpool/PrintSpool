// import React, { useCallback, useMemo } from 'react'
// import { Field } from 'formik'
// import Fuse from 'fuse.js'

// import {
//   Paper,
//   MenuItem,
//   TextField,
// } from '@mui/material'

// import Downshift from 'downshift'

// import TypeaheadStyles from './TypeaheadStyles'

// const Typeahead = ({
//   suggestions,
//   name,
//   label,
//   onChange,
// }) => {
//   const classes = TypeaheadStyles()

//   const getSuggestions = useMemo(() => {
//     const fuse = new Fuse(suggestions, {
//       shouldSort: true,
//       keys: [
//         { name: 'label', weight: 1.0 },
//       ],
//     })

//     return value => fuse.search(value).slice(0, 4)
//   }, [suggestions])

//   const renderInput = useCallback((inputProps) => {
//     const {
//       InputProps,
//       ref,
//       ...textFieldProps
//     } = inputProps

//     // const selectedSuggestion = useMemo(() => {
//     //   suggestions.find(suggestion => suggestion.value === value)
//     // }, [suggestions, textFieldProps.value])
//     return (
//       <TextField
//         label={label}
//         InputProps={{
//           ...InputProps,
//           inputRef: ref,
//           classes: {
//             root: classes.inputRoot,
//             input: classes.inputInput,
//           },
//         }}
//         {...textFieldProps}
//       />
//     )
//   }, [name, label])

//   const renderSuggestion = useCallback(({
//     suggestion,
//     index,
//     itemProps,
//     highlightedIndex,
//     selectedItem,
//   }) => {
//     const isHighlighted = highlightedIndex === index
//     const isSelected = (
//       selectedItem != null && selectedItem.value.indexOf(suggestion.value) > -1
//     )

//     return (
//       <MenuItem
//         {...itemProps}
//         key={suggestion.value}
//         selected={isHighlighted}
//         component="div"
//         style={{
//           fontWeight: isSelected ? 500 : 400,
//         }}
//       >
//         {suggestion.label}
//       </MenuItem>
//     )
//   })

//   return (
//     <Field name={name}>
//       { ({ field }) => (
//         <Downshift
//           selectedItem={
//             suggestions.find(({ value }) => value === field.value)
//             || { value: field.value || '', label: field.value || '' }
//           }
//           onStateChange={(change) => {
//             if (
//               change.type !== Downshift.stateChangeTypes.changeInput
//               && change.selectedItem == null
//             ) {
//               return
//             }

//             const value = (
//               (change.selectedItem && change.selectedItem.value)
//               || change.inputValue
//             )

//             field.onChange(value)

//             if (onChange != null) {
//               onChange(value)
//             }
//           }}
//           itemToString={item => item && item.label}
//         >
//           {({
//             getInputProps,
//             getItemProps,
//             getMenuProps,
//             highlightedIndex,
//             inputValue,
//             isOpen,
//             selectedItem,
//           }) => (
//             <div className={classes.container}>
//               {renderInput({
//                 fullWidth: true,
//                 InputProps: getInputProps({
//                   onKeyDown: (event) => {
//                     // prevent enter from submitting the form
//                     if (event.key === 'Enter') {
//                       event.preventDefault()
//                     }
//                   },
//                 }),
//               })}
//               <div {...getMenuProps()}>
//                 {isOpen ? (
//                   <Paper className={classes.paper} square>
//                     {getSuggestions(inputValue).map((suggestion, index) => (
//                       renderSuggestion({
//                         suggestion,
//                         index,
//                         itemProps: getItemProps({ item: suggestion }),
//                         highlightedIndex,
//                         selectedItem,
//                       })
//                     ))}
//                   </Paper>
//                 ) : null}
//               </div>
//             </div>
//           )}
//         </Downshift>
//       )}
//     </Field>
//   )
// }

// export default Typeahead
