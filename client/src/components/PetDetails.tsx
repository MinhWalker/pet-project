import * as React from 'react'
import { Grid, Loader, Image } from 'semantic-ui-react'
import styled from 'styled-components'
import { getPetById } from '../api/pets-api'
import Auth from '../auth/Auth'
import { Pet } from '../types/Pet'

interface PetDetailsProps {
  match: {
    params: {
      petId: string
    }
  }
  auth: Auth
}

interface PetDetailsState {
  pet: Pet | undefined
  loadingPet: boolean
}

export class PetDetails extends React.PureComponent<PetDetailsProps, PetDetailsState> {
  state: PetDetailsState = {
    pet: undefined,
    loadingPet: true,
  }

  async componentDidMount() {
    try {
      const petId = this.props.match.params.petId
      const petDetails = await getPetById(this.props.auth.getIdToken(), petId)
      this.setState({
        pet: petDetails,
        loadingPet: false,
      })
    } catch (e) {
      alert(`Failed to fetch pet: ${(e as Error).message}`)
      window.location.replace('/')
    }
  }

  renderPetState() {
    if (this.state.loadingPet) {
      return this.renderLoading()
    }
    return this.renderPet()
  }

  renderLoading() {
    return (
      <Grid.Row>
        <Loader indeterminate active inline="centered">
          Loading PET
        </Loader>
      </Grid.Row>
    )
  }

  renderPet() {
    const { pet } = this.state
    if (!pet) {
      return null
    }

    return (
      <Wrapper>
        <PetName>{pet.name}</PetName>
        {pet.attachmentUrl && <Image src={pet.attachmentUrl} size="small" wrapped />}
      </Wrapper>
    )
  }

  render() {
    return <div>{this.renderPetState()}</div>
  }
}

const Wrapper = styled.div``

const PetName = styled.div``

export default PetDetails
