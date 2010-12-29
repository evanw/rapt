#include <iostream>
#include <fstream>
#include <stack>
#include "world.pb.h"
using namespace std;

// partial template specialization for strings
template <typename T> void val(ostream *o, T value) { *o << value; }
template <> void val<const char *>(ostream *o, const char *value) { *o << '"' << value << '"'; }

class JSON
{
private:
    enum { ARRAY, OBJECT };

    stack<int> s;
    ostream *o;
    bool first;
    int i;

    string indent() { return string(2 * i, ' '); }
    bool in_array() { return !s.empty() && s.top() == ARRAY; }

    void newline_indent()
    {
        *o << (first ? "\n" : ",\n") << indent();
        first = false;
    }

public:
    JSON(ostream *out) : o(out), first(true), i(1) { *o << "{"; }
    ~JSON() { *o << "\n}\n"; }

    JSON &name(const string &name)
    {
        newline_indent();
        *o << '"' << name << "\": ";
        first = false;
        return *this;
    }

    template <typename X> JSON &value(X x)
    {
        if (in_array()) newline_indent();
        val(o, x);
        return *this;
    }

    template <typename X, typename Y> JSON &value(X x, Y y)
    {
        if (in_array()) newline_indent();
        *o << '[';
        val(o, x);
        *o << ", ";
        val(o, y);
        *o << ']';
        return *this;
    }

    JSON &array()
    {
        if (in_array()) newline_indent();
        *o << '[';
        first = true;
        i++;
        s.push(ARRAY);
        return *this;
    }

    JSON &object()
    {
        if (in_array()) newline_indent();
        *o << '{';
        first = true;
        i++;
        s.push(OBJECT);
        return *this;
    }

    JSON &end()
    {
        int t = s.top();
        first = false;
        i--;
        *o << '\n' << indent() << (t == ARRAY ? ']' : '}');
        s.pop();
        return *this;
    }
};

void convert(const string &input, const string &output)
{
    // open input
    ifstream in(input.c_str(), ios::in | ios::binary);
    if (!in.is_open())
    {
        cout << "error: could not open file \"" << input << "\"" << endl;
        return;
    }

    // parse file
    FileWorld world;
    if (!world.ParseFromIstream(&in))
    {
        cout << "error: could not parse file \"" << input << "\"" << endl;
        return;
    }

    // open output
    ofstream out(output.c_str());
    if (!out.is_open())
    {
        cout << "error: could not open file \"" << output << "\"" << endl;
        return;
    }

    JSON json(&out);
    json.name("unique_id").value(world.unique_id());
    json.name("width").value(world.width());
    json.name("height").value(world.height());
    json.name("start").value(world.players_start_x(), world.players_start_y());
    json.name("end").value(world.players_end_x(), world.players_end_y());
    json.name("entities").array();

    for (int d = 0; d < world.door_size(); d++)
    {
        const FileDoor &door = world.door(d);
        json.object();
        json.name("class").value("wall");
        json.name("start").value(door.start_x(), door.start_y());
        json.name("end").value(door.end_x(), door.end_y());
        json.end();
    }

    json.end();
}

int main(int argc, char *argv[])
{
    if (argc < 2)
    {
        cout << "usage: level_converter <lvl files>" << endl;
        return 0;
    }

    for (int i = 1; i < argc; i++)
    {
        string input = argv[i];
        string output = input;
        if (output.find(".lvl") == output.size() - 4) output = output.substr(0, output.size() - 4);
        output += ".json";

        convert(input, output);
    }

    return 0;
}
