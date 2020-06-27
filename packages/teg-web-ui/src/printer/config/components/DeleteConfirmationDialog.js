import React from 'react'
// import { compose } from 'recompose'
// import { withRouter } from 'react-router'

// import Dialog from '@material-ui/core/Dialog'
// import DialogTitle from '@material-ui/core/DialogTitle'
// import DialogContent from '@material-ui/core/DialogContent'
// import DialogContentText from '@material-ui/core/DialogContentText'
// import DialogActions from '@material-ui/core/DialogActions'
// import Button from '@material-ui/core/Button'

// import gql from 'graphql-tag'
// import { useMutation } from 'react-apollo-hooks'

export default () => <div>wat</div>
// const DELETE_CONFIG = gql`
//   mutation deleteConfig($input: DeleteConfigInput!) {
//     deleteConfig(input: $input)
//   }
// `

// const enhance = compose(
//   withRouter,
//   Component => (props) => {
//     const {
//       id,
//       collection,
//       machineID,
//       history,
//       onDelete,
//     } = props

//     const input = {
//       configFormID: id,
//       collection,
//       machineID,
//     }

//     if (onDelete != null) {
//       return (
//         <Component
//           {...props}
//         />
//       )
//     }

//     return (
//       <Mutation
//         mutation={DELETE_CONFIG}
//         variables={{ input }}
//         update={(mutationResult) => {
//           if (mutationResult.data != null) {
//             history.push('../')
//           }
//         }}
//       >
//         {
//           (deleteConfig, { called, error }) => {
//             if (error != null) {
//               throw error
//             }

//             if (called) return <div />

//             return (
//               <Component
//                 onDelete={deleteConfig}
//                 {...props}
//               />
//             )
//           }
//         }
//       </Mutation>
//     )
//   },
// )

// const FormDialog = ({
//   fullTitle,
//   title,
//   open,
//   history,
//   onDelete,
//   type,
// }) => (
//   <Dialog
//     open={open}
//     onClose={() => history.push('../')}
//     aria-labelledby="alert-dialog-description"
//   >
//     <DialogTitle>
//       { fullTitle && title }
//       { !fullTitle && `Delete ${title}?`}
//     </DialogTitle>
//     <DialogContent>
//       <DialogContentText id="alert-dialog-description">
//         {
//           `This ${type}'s configuration will be
//           perminently deleted.`
//         }
//       </DialogContentText>
//     </DialogContent>
//     <DialogActions>
//       <Button onClick={() => history.push('../')}>
//         Cancel
//       </Button>
//       <Button onClick={onDelete}>
//         Delete
//       </Button>
//     </DialogActions>
//   </Dialog>
// )

// export const Component = FormDialog
// export default enhance(FormDialog)
