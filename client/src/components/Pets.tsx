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
import styled from 'styled-components'

import { createPet, deletePet, getPets, patchPet, searchPetsByName } from '../api/pets-api'
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
  searchName: string
}

export class Pets extends React.PureComponent<PetsProps, PetsState> {
  state: PetsState = {
    pets: [],
    newPetName: '',
    loadingPets: true,
    searchName: ''
  }

  handleNameChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    this.setState({ newPetName: event.target.value })
  }

  handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    this.setState({ searchName: event.target.value })
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

  onSearchPets = async (name: string) => {
    try {
      if (!name) {
        const pets = await getPets(
          this.props.auth.getIdToken(),
        )
        this.setState({
          pets,
          loadingPets: false
        })
        return null
      }
      const pets = await searchPetsByName(
        this.props.auth.getIdToken(),
        name,
        1, // page number (modify as needed)
        10 // limit (modify as needed)
      )
      this.setState({
        pets,
        loadingPets: false
      })
    } catch (e) {
      alert(`Failed to fetch pets: ${(e as Error).message}`)
    }
  }

  onPetDetails = (petId: string) => {
    this.props.history.push(`/pets/${petId}`)
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
        {this.renderSearchInput()}

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
            value={this.state.newPetName}
          />
        </Grid.Column>
        <Grid.Column width={16}>
          <Divider />
        </Grid.Column>
      </Grid.Row>
    )
  }

  renderSearchInput() {
    return (
      <Grid.Row>
        <Grid.Column width={16}>
          <Input
            action={{
              color: 'teal',
              labelPosition: 'left',
              icon: 'search',
              content: 'Search',
              onClick: () => this.onSearchPets(this.state.searchName)
            }}
            fluid
            actionPosition="left"
            placeholder="Search pets by name..."
            onChange={this.handleSearchChange}
            value={this.state.searchName}
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
      <Wrapper>
        {this.state.pets.map((pet, pos) => {
          return (
            <WrapperItem key={pos}>
              <Item>
                <ItemTitle>
                  <Checkbox
                    onChange={() => this.onPetCheck(pos)}
                    checked={pet.done}
                  />
                  <ItemName onClick={() => { this.onPetDetails(pet.petId) }}>{pet.name}</ItemName>
                </ItemTitle>
                <ItemControl>
                  <span>{pet.dueDate}</span>
                  <div>
                    <Button
                      icon
                      color="blue"
                      onClick={() => this.onEditButtonClick(pet.petId)}
                    >
                      <Icon name="pencil" />
                    </Button>
                    <Button
                      icon
                      color="red"
                      onClick={() => this.onPetDelete(pet.petId)}
                    >
                      <Icon name="delete" />
                    </Button>
                  </div>
                </ItemControl>
              </Item>
              <ItemImage onClick={() => { this.onPetDetails(pet.petId) }}>
                {pet.attachmentUrl && (
                  <Image src={pet.attachmentUrl} size="small" wrapped />
                )}
              </ItemImage>
              <Divider />
            </WrapperItem>
          )
        })}
      </Wrapper>
    )
  }

  calculateDueDate(): string {
    const date = new Date()
    date.setDate(date.getDate() + 7)

    return dateFormat(date, 'yyyy-mm-dd') as string
  }
}

const Wrapper = styled.div`
  display: 'flex',
  flexDirection: 'column',
`

const WrapperItem = styled.div`
  display: 'flex',
  flexDirection: 'column'
`

const Item = styled.div(() => ({
  display: 'flex',
  justifyContent: 'space-between',
}))

const ItemName = styled.p(() => ({
  cursor: 'pointer',
  ":hover": {
    color: '#42f5a1'
  }
}))

const ItemImage = styled.div(() => ({
  cursor: 'pointer',
}))

const ItemTitle = styled.div(() => ({
  display: 'flex',
  columnGap: '8px',
  alignItems: 'center',
}))

const ItemControl = styled.div(() => ({
  display: 'flex',
  justifyContent: 'space-between',
  columnGap: '8px',
  alignItems: 'center',
}))