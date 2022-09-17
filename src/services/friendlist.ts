export class FriendList {
  private friends: { [name: string]: string } = {}
  private readonly storageKey = 'friends'
  constructor() {
    this.loadFriends()
  }

  public addFriend(name: string, address: string): void {
    this.friends[name] = address
    this.saveFriends()
  }

  public removeFriend(name: string): void {
    delete this.friends[name]
    this.saveFriends()
  }

  public getFriends(): { [name: string]: string } {
    return { ...this.friends }
  }

  private loadFriends() {
    const friends = localStorage.getItem(this.storageKey)

    if (friends) {
      this.friends = JSON.parse(friends)
    }
  }

  private saveFriends() {
    localStorage.setItem(this.storageKey, JSON.stringify(this.friends))
  }
}
