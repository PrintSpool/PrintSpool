import styled from 'styled-components'
import {
  Grid,
  IconButton,
} from '@material-ui/core'

const AlignText = styled.div`
  text-align: ${props => props.textAlign || 'center'};
`

const JogButton = ({ textAlign, xs, children, ...props }) => (
  <Grid item xs={xs}>
    <AlignText textAlign={textAlign}>
      <IconButton {...props}>
        {children}
      </IconButton>
    </AlignText>
  </Grid>
)

export default JogButton
