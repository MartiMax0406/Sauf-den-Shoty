class Player:
    def __init__(self, name):
        self.name = name
        self.position = 0  # Spielfeldposition gezählt
        self.shots = 0  # Anzahl der Shots

    def move(self, steps):
        self.position += steps

    def to_dict(self):
        return {"name": self.name, "position": self.position}

    @staticmethod
    def from_dict(data):
        return Player(data['name']).with_position(data['position'])

    def with_position(self, pos):
        self.position = pos
        return self
