import type { Signer } from '@ethersphere/bee-js'
import { Bee, Utils } from '@ethersphere/bee-js'
import randomBytes from 'randombytes'
import { Buffer } from 'buffer'
import Wallet from 'ethereumjs-wallet'
import React, { ChangeEvent, FormEvent, useEffect, useState } from 'react'
import { Button, Col, Container, Form, FormControl, ListGroup, ListGroupItemProps, Row, Stack } from 'react-bootstrap'
import Web3Modal, { IProviderOptions } from 'web3modal'
import './App.css'
import ListMessages from './Messages'
import * as Icon from 'react-bootstrap-icons'
import SendMessage from './SendMessage'
import { prefixAddress } from './Utils'
import { FriendList } from './services/friendlist'

const friendList = new FriendList()

interface Buddy {
  name: string
  address: string
}

function App() {
  // # nugaon # mollas # metacertain
  // default bee is pointing to the gateway
  const [bee, setBee] = useState<Bee>(new Bee('http://localhost:1633'))
  const [friends, setFriends] = useState<React.ReactElement[]>([])
  const [showAddFriend, setShowAddFriend] = useState(false)
  const [buddy, setBuddy] = useState<Buddy | null>(null)
  const [privkeyOrSigner, setPrivkeyOrSigner] = useState<Uint8Array | Signer>(randomBytes(32))
  const [wallet, setWallet] = useState<Wallet | null>(null)
  const [otherEthAddress, setOtherEthAddress] = useState<string | null>(null)
  const [myMessages, setMyMessages] = useState<MessageFormat[]>([])
  const [myEthAddress, setMyEthAddress] = useState<string | null>(null)
  const [walletConnected, setWalletConnected] = useState<boolean>(false)

  const connectWallet = async () => {
    const providerOptions: IProviderOptions = {
      /* See Provider Options Section */
    }

    const web3Modal = new Web3Modal({
      network: 'mainnet', // optional
      providerOptions, // required
    })

    const provider = await web3Modal.connect()
    const signer = await Utils.makeEthereumWalletSigner(provider)
    setMyEthAddress(prefixAddress(Utils.bytesToHex(signer.address)))
    setPrivkeyOrSigner(signer)
    setWalletConnected(true)
    setMyMessages([])

    window.ethereum.once('accountsChanged', (accounts: string[]) => {
      console.log('changed account to', accounts[0])
      connectWallet()
      // Time to reload your interface with accounts[0]!
    })
  }

  // constructor
  useEffect(() => {
    const setStringKey = (key: string) => {
      const keyBytes = Utils.hexToBytes(key)
      setByteKey(keyBytes)
    }

    /** bytes represent hex keys */
    const setByteKey = (keyBytes: Uint8Array) => {
      setPrivkeyOrSigner(keyBytes)
      const wallet = new Wallet(Buffer.from(keyBytes))
      setWallet(wallet)
    }

    if (window.swarm && window.origin === 'null') {
      const beeUrl = window.swarm.web2Helper.fakeBeeApiAddress()
      setBee(new Bee(beeUrl))
      ;(async () => {
        //private key handling
        const windowPrivKey = await window.swarm.localStorage.getItem('private_key')

        if (windowPrivKey) {
          setStringKey(windowPrivKey)
        } else {
          const key = randomBytes(32)
          await window.swarm.localStorage.setItem('private_key', Utils.bytesToHex(key))
          setByteKey(key)
        }
      })()
    } else {
      const windowPrivKey = window.localStorage.getItem('private_key')

      if (windowPrivKey) {
        setStringKey(windowPrivKey)
      } else {
        const key = randomBytes(32)
        window.localStorage.setItem('private_key', Utils.bytesToHex(key))
        setByteKey(key)
      }
    }

    // load friends
    setFriends(friendListItems())
  }, [])

  useEffect(() => {
    if (!wallet) return
    setMyEthAddress(wallet.getAddressString())
  }, [wallet])

  const onEthAddressChange = (e: ChangeEvent<HTMLInputElement>) => {
    setOtherEthAddress(e.target.value)
    setMyMessages([])
    //other's messages are set in the listMessages
  }

  const onSubmitAddFriend = (e: React.SyntheticEvent) => {
    e.preventDefault()
    const target = e.target as typeof e.target & {
      name: { value: string }
      address: { value: string }
    }
    console.log('target', target.name.value, target.address.value)

    // friend handling
    friendList.addFriend(target.name.value, target.address.value)
    chooseBuddy(target.name.value, target.address.value)
    setFriends(friendListItems())
    setShowAddFriend(false)
    //other's messages are set in the listMessages
  }

  const chooseBuddy = (name: string, address: string) => {
    setBuddy({ name, address })
    setOtherEthAddress(address)
    setMyMessages([])
  }

  const friendListItems = (): React.ReactElement[] => {
    const items: React.ReactElement[] = []
    for (const [name, address] of Object.entries(friendList.getFriends())) {
      items.push(
        <ListGroup.Item key={name} onClick={() => chooseBuddy(name, address)} action>
          {name}
        </ListGroup.Item>,
      )
    }

    return items
  }

  const onShowAddFriendClick = () => {
    setShowAddFriend(true)
  }

  return (
    <Container className="App" fluid>
      <div className="App-header">
        <h1 id="purityweb-logo" className="fadeInDown animated">
          AnyTalk
        </h1>
      </div>

      <Container className="maincontent">
        <Stack gap={2}>
          <div className="font-weight-bold">
            <span>{myEthAddress} </span>
            <span hidden={walletConnected}>
              <Icon.Wallet2 onClick={() => connectWallet()} style={{ cursor: 'pointer' }} />
            </span>
          </div>
        </Stack>

        <hr />

        <Container fluid="md">
          <Row>
            <Col style={{ marginBottom: 24 }}>
              <div className="centerDiv">
                <h3>
                  <span>Friends</span>{' '}
                  <span hidden={showAddFriend} onClick={onShowAddFriendClick} style={{ cursor: 'pointer' }}>
                    <Icon.PlusCircleFill />
                  </span>
                  <span hidden={!showAddFriend} onClick={() => setShowAddFriend(false)} style={{ cursor: 'pointer' }}>
                    <Icon.DashCircleFill />
                  </span>
                </h3>
                <Form
                  onSubmit={onSubmitAddFriend}
                  hidden={!showAddFriend && Boolean(Object.entries(friends).length)}
                  style={{ margin: '24px' }}
                >
                  <Form.Group className="mb-3" controlId="formBasicEmail">
                    <Form.Label>Name</Form.Label>
                    <FormControl aria-describedby="basic-addon3" style={{ textAlign: 'center' }} name="name" />
                  </Form.Group>

                  <Form.Group className="mb-3" controlId="formBasicEmail">
                    <Form.Label>Ethereum address</Form.Label>
                    <FormControl aria-describedby="basic-addon3" style={{ textAlign: 'center' }} name="address" />
                  </Form.Group>

                  <Button variant="primary" type="submit">
                    Add
                  </Button>
                </Form>

                <div>
                  <ListGroup style={{ maxHeight: '120px', overflow: 'hidden', overflowY: 'scroll' }}>
                    {[...friends]}
                  </ListGroup>
                </div>
              </div>
            </Col>

            <Col>
              <div style={{ maxWidth: 300 }} className="centerDiv">
                <ListMessages
                  bee={bee}
                  myEthAddress={myEthAddress}
                  othersEthAddress={otherEthAddress}
                  myMessages={myMessages}
                  setMyMessages={setMyMessages}
                  othersName={buddy?.name || null}
                />

                <hr />

                <SendMessage
                  bee={bee}
                  otherEthAddress={otherEthAddress}
                  privKey={privkeyOrSigner}
                  onSendMessage={message => setMyMessages([...myMessages, message])}
                />
              </div>
            </Col>
          </Row>
        </Container>
      </Container>
    </Container>
  )
}

export default App
