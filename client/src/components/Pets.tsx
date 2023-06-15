import dateFormat from 'dateformat'
import { History } from 'history'
import update from 'immutability-helper'
import * as React from 'react'
import {
  Button,
  Checkbox,
  Divider,
  Grid,
  Header,
  Icon,
  Input,
  Image,
  Loader
} from 'semantic-ui-react'

import { createPet, deletePet, getPets, patchPet } from '../api/pets-api'
import Auth from '../auth/Auth'
import { Pet } from '../types/Pet'

interface PetsProps {
  auth: Auth
  history: History
}

interface PetsState {
  pets: Pet[]
  newPetName: string
  loadingPets: boolean
}

export class Pets extends React.PureComponent<PetsProps, PetsState> {
  state: PetsState = {
    pets: [],
    newPetName: '',
    loadingPets: true
  }

  handleNameChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    this.setState({ newPetName: event.target.value })
  }

  onEditButtonClick = (petId: string) => {
    this.props.history.push(`/pets/${petId}/edit`)
  }

  onPetCreate = async (event: React.ChangeEvent<HTMLButtonElement>) => {
    try {
      const dueDate = this.calculateDueDate()
      const newPet = await createPet(this.props.auth.getIdToken(), {
        name: this.state.newPetName,
        dueDate
      })
      this.setState({
        pets: [...this.state.pets, newPet],
        newPetName: ''
      })
    } catch {
      alert('Pet creation failed')
    }
  }

  onPetDelete = async (petId: string) => {
    try {
      await deletePet(this.props.auth.getIdToken(), petId)
      this.setState({
        pets: this.state.pets.filter(pet => pet.petId !== petId)
      })
    } catch {
      alert('Pet deletion failed')
    }
  }

  onPetCheck = async (pos: number) => {
    try {
      const pet = this.state.pets[pos]
      await patchPet(this.props.auth.getIdToken(), pet.petId, {
        name: pet.name,
        dueDate: pet.dueDate,
        done: !pet.done
      })
      this.setState({
        pets: update(this.state.pets, {
          [pos]: { done: { $set: !pet.done } }
        })
      })
    } catch {
      alert('Pet deletion failed')
    }
  }

  async componentDidMount() {
    try {
      const pets = await getPets(this.props.auth.getIdToken())
      this.setState({
        pets,
        loadingPets: false
      })
    } catch (e) {
      alert(`Failed to fetch pets: ${(e as Error).message}`)
    }
  }

  render() {
    return (
      <div>
        <Header as="h1">PETs</Header>

        {this.renderCreatePetInput()}

        {this.renderPets()}
      </div>
    )
  }

  renderCreatePetInput() {
    return (
      <Grid.Row>
        <Grid.Column width={16}>
          <Input
            action={{
              color: 'teal',
              labelPosition: 'left',
              icon: 'add',
              content: 'New pet',
              onClick: this.onPetCreate
            }}
            fluid
            actionPosition="left"
            placeholder="To change the world..."
            onChange={this.handleNameChange}
          />
        </Grid.Column>
        <Grid.Column width={16}>
          <Divider />
        </Grid.Column>
      </Grid.Row>
    )
  }

  renderPets() {
    if (this.state.loadingPets) {
      return this.renderLoading()
    }

    return this.renderPetsList()
  }

  renderLoading() {
    return (
      <Grid.Row>
        <Loader indeterminate active inline="centered">
          Loading PETs
        </Loader>
      </Grid.Row>
    )
  }

  renderPetsList() {
    return (
      <Grid padded>
        {this.state.pets.map((pet, pos) => {
          return (
            <Grid.Row key={pet.petId}>
              <Grid.Column width={1} verticalAlign="middle">
                <Checkbox
                  onChange={() => this.onPetCheck(pos)}
                  checked={pet.done}
                />
              </Grid.Column>
              <Grid.Column width={10} verticalAlign="middle">
                {pet.name}
              </Grid.Column>
              <Grid.Column width={3} floated="right">
                {pet.dueDate}
              </Grid.Column>
              <Grid.Column width={1} floated="right">
                <Button
                  icon
                  color="blue"
                  onClick={() => this.onEditButtonClick(pet.petId)}
                >
                  <Icon name="pencil" />
                </Button>
              </Grid.Column>
              <Grid.Column width={1} floated="right">
                <Button
                  icon
                  color="red"
                  onClick={() => this.onPetDelete(pet.petId)}
                >
                  <Icon name="delete" />
                </Button>
              </Grid.Column>
              {pet.attachmentUrl && (
                <Image src={pet.attachmentUrl} size="small" wrapped />
              )}
              <Grid.Column width={16}>
                <Divider />
              </Grid.Column>
            </Grid.Row>
          )
        })}
      </Grid>
    )
  }

  calculateDueDate(): string {
    const date = new Date()
    date.setDate(date.getDate() + 7)

    return dateFormat(date, 'yyyy-mm-dd') as string
  }
}
