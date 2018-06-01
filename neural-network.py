#!/usr/bin/python3

from sklearn.neural_network import MLPClassifier

# Features
X = [[0, 0], [1, 1], [2, 2]]
y = [0, 1, 2]
clf = MLPClassifier(solver='lbfgs', alpha=1e-5,
                            hidden_layer_sizes=(5,), random_state=1)

clf.fit(X, y)

print(clf.predict([[0, 0], [0, 1], [0, 2]]))
