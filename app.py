import json
import pandas
import pulp

from flask import Flask, Response
from flask import jsonify, request, send_from_directory, stream_with_context


parameters = {
    "demand": None,
    "supply": None,
    "n": None,
    "m": None
}


frame = None


levels = pandas.read_pickle("data/pkl/levels.pkl")
cached = pandas.read_pickle("data/pkl/supply.pkl")
mapped = pandas.read_pickle("data/pkl/mapped.pkl")



def parse(file):
    dataframe = pandas.read_csv(file)
    copied = dataframe.copy()
    copied.emid = copied.emid.apply(lambda emid: f"{int(emid):08d}" if pandas.notna(emid) else None)
    return copied


def mix(frame):
    count = frame.groupby("soln")["stat"].value_counts()
    norms = frame.groupby("soln")["emid"].count()
    means = (count / norms).unstack().mean().to_dict()
    for key in ["I", "E", "U"]:
        if key not in means:
            means[key] = 0.0
    return means


def extract(frame, query):
    for field, value in query.items():
        if value == "NA":
            break
        frame = frame.loc[frame[field] == value]
    return frame


def gap(frame):
    exploded = frame.explode("gaps")
    count = exploded.groupby(["soln", "code"])["gaps"].value_counts()
    norms = frame.groupby(["soln", "code"])["emid"].count()
    means = (count / norms).fillna(0).to_frame(name="perc")
    reset = means.reset_index().drop(columns="soln").dropna()
    sorts = reset.sort_values(["code", "perc"])
    codes = sorts.groupby("code").head(10)
    group = codes.groupby("code").apply(lambda x: x.set_index("gaps")["perc"].to_dict()).to_dict()
    return group


def optimise(demand, supply, n, m):
    global frame
    supply = pandas.merge(supply, cached, on="emid", how="left")
    salary = supply.explode("code")[["code", "cost"]]
    salary.cost = salary.apply(lambda values: values.cost[values.code], axis=1)
    salary = salary.groupby("code", as_index=False).mean()
    means = {code: mean for code, mean, in salary.values}
    limit = round(demand.shape[0] * (m / 100))
    codes = demand.code.value_counts().to_dict()
    occup = {code: emid for code, emid, *_ in demand.loc[~demand.emid.isna()].values}
    emids = {emid for emid in supply.emid}
    possb = supply.set_index("emid")["code"].to_dict()
    costs = supply.set_index("emid")["cost"].to_dict()
    demand.loc[demand.index, "cost"] = demand.apply(
        lambda values: costs[values.emid][values.code] if values.emid in costs else means[values.code],
        axis=1
    )
    prespend = demand.cost.sum()
    problem = pulp.LpProblem("tba", pulp.LpMinimize)
    x = {(emid, code) for emid in emids for code in codes if code in possb[emid]}
    b = pulp.LpVariable.dicts("b", x, cat="Binary")
    problem += pulp.lpSum(b[emid, code] * costs[emid].get(code) for emid, code in b)
    for emid in emids:
        problem += pulp.lpSum(b[emid, code] for code in codes if (emid, code) in b) <= 1
    for code in codes:
        problem += pulp.lpSum(b[emid, code] for emid in emids if (emid, code) in b) == codes[code]
    for emid in emids:
        if emid in occup:
            problem += pulp.lpSum(b[emid, code] for code in codes if (emid, code) in b) == 1
    problem += pulp.lpSum(b[emid, code] for emid, code in b if emid in occup and occup[emid] != code) <= limit
    solutions = list()
    iteration = 0
    while iteration < n:
        status = problem.solve(pulp.PULP_CBC_CMD(msg=False))
        if status != pulp.LpStatusOptimal:
            break
        solution = [(emid, code, iteration) for emid, code in b if b[emid, code].varValue > 0.0]
        problem += pulp.lpSum(b[emid, code] for emid, code, _ in solution) <= len(solution) - 1
        solutions.extend(solution)
        iteration = iteration + 1
        progress = round(iteration / n, 2) * 100
        response = {"response": "success", "progress": progress}
        yield json.dumps(response) + "\n"
    columns = ["emid", "code", "soln"]
    frame = pandas.DataFrame(data=solutions, columns=columns)
    frame = pandas.merge(frame, supply[["emid", "curr", "cost"]], on="emid")
    frame = pandas.merge(frame, levels, on="code")
    frame = pandas.merge(frame, mapped, on=["code", "curr"])
    frame.cost = frame.apply(lambda values: values.cost[values.code], axis=1)
    postspend, *_ = frame.groupby("soln")["cost"].sum().to_list()
    response = {"response": "success", "progress": progress}
    frame.loc[frame.code != frame.curr, "stat"] = "I"
    frame.loc[frame.code == frame.curr, "stat"] = "U"
    frame.loc[frame.curr.isna(), "stat"] = "E"
    saving = prespend - postspend
    saving = f"{saving:,.2f}"
    smix = mix(frame)
    sgap = gap(frame)
    response = {"response": "success", "progress": 100, "saving": saving, "smix": smix, "sgap": sgap}
    yield json.dumps(response) + "\n"


app = Flask(__name__)


@app.route("/", methods=["GET"])
def application():
    return send_from_directory("static", "app.html")


@app.route("/update", methods=["POST"])
def update():
    global parameters
    demand = request.files["demand"]
    supply = request.files["supply"]
    n, m = request.form["n"], request.form["m"]
    demand = parse(demand)
    demand = pandas.merge(demand, levels, on="code", how="left")
    supply = parse(supply)
    parameters["demand"] = demand
    parameters["supply"] = supply
    parameters["n"] = int(n)
    parameters["m"] = int(m)
    frmw = demand.frmw.unique()
    frmw = sorted(frmw)
    response = {"status": "successful", "frmw": frmw}
    return json.dumps(response)


@app.route("/stream", methods=["GET"])
def stream():
    global parameters
    return Response(stream_with_context(optimise(**parameters)), mimetype="application/json")


@app.route("/process", methods=["POST"])
def process():
    global frame
    frmw = request.form["frmw"]
    faml = request.form["faml"]
    subf = request.form["subf"]
    catg = request.form["catg"]
    optn = request.form["optn"]
    query = {
        "frmw": frmw,
        "faml": faml,
        "subf": subf,
        "catg": catg
    }
    demand = parameters["demand"]
    demand = extract(demand, query)
    for key, value in query.items():
        if value == "NA":
            break
    refined = demand[key].unique()
    refined = sorted(refined)
    n, _ = demand.shape
    r, _ = demand.loc[demand.emid.isna()].shape
    response = {"status": "successful", "n": n, "r": r}
    if optn != "null":
        response[key] = refined
    if frame is not None:
        _frame = extract(frame, query)
        smix = mix(_frame)
        sgap = gap(_frame)
        response["smix"] = smix
        response["sgap"] = sgap
        response["code"] = sorted([key for key in sgap])
    return json.dumps(response)



@app.route("/test", methods=["GET"])
def test():
    global parameters
    print(parameters)
    print(frame)
    response = {"status": "successful"}
    return json.dumps(response)



if __name__ == "__main__":
    app.run(debug=True)
